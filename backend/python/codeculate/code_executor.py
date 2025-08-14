"""
    CodeExecutor
    =================================================================
    Verilen kodu geçici bir dosya olarak kaydedip çalıştıran,
    karbon salınımını ölçen ve sonucu döndüren, codeculate için ana yürütme
    sınıfıdır. Hem yorumlanan hem de derlenen dillerle çalışabilir. Frontend'e
    gönderilecek karbon emisyon sonuçları burada ölçülür.

    Özellikler:
    - Kodu geçici bir dosya olarak kaydeder.
    - Kodu compile eder.
    - Kodu çalıştırır.
    - Kodun karbon salınımını ölçer.
    - Sonucu döndürür (frontend'e).
"""

import os
import tempfile
import subprocess
import time
from codecarbon import EmissionsTracker
from datetime import datetime
from typing import Dict, Any, Tuple, List
from config.logging_config import setup_logger

logger = setup_logger('code_executor')

################ Desteklenen diller ve uzantıları ################
LANG_FILE_EXTENSIONS = {
    'python': '.py',
    'javascript': '.js',
    'java': '.java',
    'cpp': '.cpp',
    'c': '.c'
}

################ Compiler komutları ################
COMPILERS = {
    'java': lambda file: (
        ['javac', file],
        ['java', '-cp', os.path.dirname(file), os.path.basename(file).replace('.java', '')]
    ),
    'cpp': lambda file: (
        ['g++', file, '-o', file.replace('.cpp', '')],
        [file.replace('.cpp', '')]
    ),
    'c': lambda file: (
        ['gcc', file, '-o', file.replace('.c', '')],
        [file.replace('.c', '')]
    )
}

################ Interpreter komutları ################
INTERPRETERS = {
    'python': lambda file: ['python', file],
    'javascript': lambda file: ['node', file]
}

################========== CodeExecutor ==========################
class CodeExecutor:
    def __init__(self):
        logger.info("CodeExecutor initialized with supported languages: " + ", ".join(LANG_FILE_EXTENSIONS.keys()))

    ################ Kodu çalıştırır ve emisyon hesaplaması yapar ################
    def process(self, code: str, language: str, repeat: int, scale_threshold: int, timeout: int = 30, db_manager=None) -> Dict[str, Any]:
        logger.info(f"Processing {language} code with {repeat} repetitions (threshold: {scale_threshold})")
        
        # Benzer kod kontrolü
        has_similar, similar_record = db_manager.get_existing_report(
            code=code,
            language=language,
            execution_count=repeat,
            scale_threshold=scale_threshold
        )

        # Benzer kod var ise benzer kodun sonuçlarını döndür
        if has_similar:
            logger.info("Found cached results, returning from database")
            return {
                'total_emissions': similar_record['total_carbon_emission'],
                'avg_emissions': similar_record['carbon_per_execution'],
                'total_execution_time': similar_record['execution_duration_seconds'],
                'avg_execution_time': similar_record['execution_duration_seconds'] / repeat,
                'repeat': repeat,
                'successful_runs': repeat,
                'failed_runs': 0,
                'language': language,
                'last_result': {
                    'success': True,
                    'stdout': '(Cached result from similar execution)',
                    'stderr': '',
                    'execution_time': similar_record['execution_duration_seconds'],
                    'emissions': similar_record['total_carbon_emission']
                },
                'is_cached': True,
                'is_scaled': similar_record['is_scaled'],
                'scale_threshold': scale_threshold
            }

        # Kodu compile et
        temp_file = None
        try:
            temp_file = self.create_temp_code_file(code, language)
            logger.debug(f"Created temporary file: {temp_file}")
            
            cmd, error = self.get_run_command(temp_file, language)

            # Compile hatası var ise, hata mesajıyla veriyi döndür
            if error:
                logger.error(f"Compilation error: {error}")
                return {
                    'total_emissions': 0,
                    'avg_emissions': 0,
                    'total_execution_time': 0,
                    'avg_execution_time': 0,
                    'repeat': repeat,
                    'successful_runs': 0,
                    'failed_runs': repeat,
                    'language': language,
                    'last_result': {
                        'success': False,
                        'stdout': '',
                        'stderr': error,
                        'execution_time': 0,
                        'emissions': 0
                    },
                    'is_cached': False,
                    'is_scaled': False,
                    'scale_threshold': scale_threshold
                }

            # Tekrar sayısı, ölçeklendirme eşiğinden büyük ise ölçeklendirme ayarla
            actual_repeat = min(scale_threshold, repeat)
            scale_factor = repeat / actual_repeat if repeat > scale_threshold else 1
            
            if repeat > scale_threshold:
                logger.info(f"Scaling enabled: actual_repeat={actual_repeat}, scale_factor={scale_factor}")

            # Çıktı sonuçları
            combined_output = ""
            combined_error = ""
            all_successful = True

            # Codecarbon'u başlat
            logger.info("Starting emissions tracking")
            tracker = EmissionsTracker()
            tracker.start()
            start_time = time.time()

            for i in range(actual_repeat):
                logger.debug(f"Running iteration {i+1}/{actual_repeat}")
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
                    success = (result.returncode == 0)
                    stdout = result.stdout
                    stderr = result.stderr
                    
                    if success:
                        logger.debug(f"Iteration {i+1} completed successfully")
                    else:
                        logger.warning(f"Iteration {i+1} failed with error: {stderr}")
                        
                except subprocess.TimeoutExpired:
                    logger.error(f"Iteration {i+1} timed out after {timeout} seconds")
                    success = False
                    stdout = ""
                    stderr = f"Execution timeout ({timeout} seconds)"

                # Çıktı sonuçlarını alma
                if not success:
                    all_successful = False
                combined_output += f"=== Run {i+1}/{actual_repeat} ===\n{stdout}\n"
                if stderr:
                    combined_error += f"=== Run {i+1}/{actual_repeat} Error ===\n{stderr}\n"
                if "Execution timeout" in stderr:
                    logger.warning("Stopping execution due to timeout")
                    break

            # Codecarbon'u durdur
            execution_time = time.time() - start_time
            emissions = tracker.stop()
            logger.info(f"Execution completed: {execution_time:.2f}s, {emissions:.6f}g CO2")

            # Gerekli ise ölçeklendirme yap
            if repeat > scale_threshold:
                execution_time *= scale_factor
                emissions *= scale_factor
                logger.info(f"Scaled results: {execution_time:.2f}s, {emissions:.6f}g CO2")

        # Hata yönetimi
        except Exception as e:
            logger.error(f"Error during execution: {str(e)}", exc_info=True)
            if 'tracker' in locals() and tracker.is_tracking:
                tracker.stop()
            return {
                'total_emissions': 0,
                'avg_emissions': 0,
                'total_execution_time': 0,
                'avg_execution_time': 0,
                'repeat': repeat,
                'successful_runs': 0,
                'failed_runs': repeat,
                'language': language,
                'last_result': {
                    'success': False,
                    'stdout': '',
                    'stderr': str(e),
                    'execution_time': 0,
                    'emissions': 0
                },
                'is_cached': False,
                'is_scaled': False,
                'scale_threshold': scale_threshold
            }
        finally:
            if temp_file:
                self.cleanup_temp_files(temp_file)

        # İşlem bitti, sonuçları tut
        total_emissions = emissions
        total_execution_time = execution_time
        successful_runs = repeat if all_successful else 0
        failed_runs = 0 if all_successful else repeat
        avg_emissions = total_emissions / repeat if repeat else 0
        avg_execution_time = total_execution_time / repeat if repeat else 0
        last_result = {
            'success': all_successful,
            'stdout': combined_output,
            'stderr': combined_error,
            'execution_time': execution_time,
            'emissions': emissions
        }

        # Verileri database'e kaydet
        if successful_runs > 0:
            try:
                logger.info("Saving results to database")
                db_manager.save_report(
                    programming_language=language,
                    execution_count=repeat,
                    total_carbon_emission=total_emissions,
                    execution_duration=total_execution_time,
                    code_text=code,
                    is_scaled=(repeat > scale_threshold),
                    scale_threshold=scale_threshold
                )
            except Exception as e:
                logger.error(f"Error saving to database: {str(e)}", exc_info=True)

        # Sonuçları döndür (frontend'e gönderilecek)
        logger.info("Processing completed successfully")
        return {
            'total_emissions': total_emissions,
            'avg_emissions': avg_emissions,
            'total_execution_time': total_execution_time,
            'avg_execution_time': avg_execution_time,
            'repeat': repeat,
            'successful_runs': successful_runs,
            'failed_runs': failed_runs,
            'language': language,
            'last_result': last_result,
            'is_cached': False,
            'is_scaled': (repeat > scale_threshold),
            'scale_threshold': scale_threshold
        }

    ################ Kodun çalıştırılabilmesi için run komutunu döndürür ###############
    def get_run_command(self, file_path: str, language: str) -> Tuple[List[str], str]:
        language = language.lower()
        logger.debug(f"Getting run command for {language} file: {file_path}")
        
        if language in COMPILERS:
            return self.compile_code(file_path, language)
        if language in INTERPRETERS:
            logger.debug(f"Using interpreter command: {INTERPRETERS[language](file_path)}")
            return INTERPRETERS[language](file_path), None
            
        logger.error(f"Unsupported language: {language}")
        return None, f"Unsupported language: {language}"

    ################ Compile edilebilen kodu compile eder ###############
    def compile_code(self, file_path: str, language: str) -> Tuple[List[str], str]:
        if language not in COMPILERS:
            return None, None

        logger.info(f"Compiling {language} code")
        compile_cmd, run_cmd = COMPILERS[language](file_path)
        logger.debug(f"Compile command: {compile_cmd}")
        logger.debug(f"Run command: {run_cmd}")

        try:
            compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)

            if compile_result.returncode != 0:
                logger.error(f"Compilation failed: {compile_result.stderr}")
                return None, f"Compilation Error:\n{compile_result.stderr}"

            logger.info("Compilation successful")
            return run_cmd, None
            
        except Exception as e:
            logger.error(f"Error during compilation: {str(e)}", exc_info=True)
            return None, f"Compilation Error: {str(e)}"

    ################ Kodun çalıştırılabilmesi için Main isimli geçici bir dosya oluşturur ###############
    def create_temp_code_file(self, code: str, language: str) -> str:
        try:
            temp_dir = tempfile.mkdtemp()
            file_name = 'Main' + LANG_FILE_EXTENSIONS[language.lower()]
            temp_file_path = os.path.join(temp_dir, file_name)
            
            with open(temp_file_path, 'w', encoding='utf-8') as temp_file:
                temp_file.write(code)
                
            logger.debug(f"Created temporary file: {temp_file_path}")
            return temp_file_path
            
        except Exception as e:
            logger.error(f"Error creating temporary file: {str(e)}", exc_info=True)
            raise

    ################ Geçişi olarak oluşturulan dosyaları ve klasörü siler ###############
    def cleanup_temp_files(self, temp_file: str):
        try:
            temp_dir = os.path.dirname(temp_file)
            logger.debug(f"Cleaning up temporary directory: {temp_dir}")
            
            for ext in ['.class', '.exe', '']:
                compiled_file = os.path.join(temp_dir, 'Main' + ext)
                if os.path.exists(compiled_file):
                    os.unlink(compiled_file)
                    logger.debug(f"Removed file: {compiled_file}")
                    
            if os.path.exists(temp_file):
                os.unlink(temp_file)
                logger.debug(f"Removed temporary file: {temp_file}")
                
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
                logger.debug(f"Removed temporary directory: {temp_dir}")
                
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {str(e)}", exc_info=True)