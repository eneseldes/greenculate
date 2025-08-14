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
import logging
from datetime import datetime
from typing import Dict, Any

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    ################ Kodu çalıştırır ve emisyon hesaplaması yapar ################
    # Database'de benzer kod var ise benzer kodun sonuçlarını döndürür.
    def process(self, code: str, language: str, repeat: int, scale_threshold: int, timeout: int = 30, db_manager=None) -> Dict[str, Any]:
        # Benzer kod kontrolü
        has_similar, similar_record = db_manager.get_existing_report(
            code=code,
            language=language,
            execution_count=repeat,
            scale_threshold=scale_threshold
        )

        # Benzer kod var ise benzer kodun sonuçlarını döndür
        if has_similar:
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
            cmd, error = self.get_run_command(temp_file, language)

            # Compile hatası var ise, hata mesajıyla veriyi döndür
            if error:
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

            # Çıktı sonuçları
            combined_output = ""
            combined_error = ""
            all_successful = True

            # Codecarbon'u başlat
            tracker = EmissionsTracker()
            tracker.start()
            start_time = time.time()

            for i in range(actual_repeat):
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
                    success = (result.returncode == 0)
                    stdout = result.stdout
                    stderr = result.stderr
                # Timeout hatası, exception fırlat
                except subprocess.TimeoutExpired:
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
                    break

            # Codecarbon'u durdur
            execution_time = time.time() - start_time
            emissions = tracker.stop()

            # Gerekli ise ölçeklendirme yap
            if repeat > scale_threshold:
                execution_time *= scale_factor
                emissions *= scale_factor

        # Hata yönetimi
        except Exception as e:
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
    # Return değeri: (komut, hata)
    # Komut: kodun çalıştırılabilmesi için run komutu
    # Hata: (var ise) interpreter veya compiler'ın dönderdiği hata mesajı
    def get_run_command(self, file_path: str, language: str) -> Tuple[List[str], str]:
        language = language.lower()
        if language in COMPILERS:
            return self.compile_code(file_path, language)
        if language in INTERPRETERS:
            return INTERPRETERS[language](file_path), None
        return None, f"Unsupported language: {language}"

    ################ Compile edilebilen kodu compile eder ###############
    # Return değeri: (komut, hata)
    # Komut: compile edilen kodun çalıştırılabilmesi için run komutu
    # Hata: (var ise) compiler'ın dönderdiği hata mesajı
    def compile_code(self, file_path: str, language: str) -> Tuple[List[str], str]:
        # İlgili dil compiler değil ise geç
        if language not in COMPILERS:
            return None, None

        # İlgili kodun compile ve run komutlarını al
        compile_cmd, run_cmd = COMPILERS[language](file_path)

        # Alınan komutla dosyayı compile et
        compile_result = subprocess.run(compile_cmd, capture_output=True, text=True)

        # Compile başarısız
        if compile_result.returncode != 0:
            return None, f"Compilation Error:\n{compile_result.stderr}"

        # Compile başarılı
        return run_cmd, None

    ################ Kodun çalıştırılabilmesi için Main isimli geçici bir dosya oluşturur ###############
    def create_temp_code_file(self, code: str, language: str) -> str:
        temp_dir = tempfile.mkdtemp()
        # Kodun diline göre uzantı oluşturur
        file_name = 'Main' + LANG_FILE_EXTENSIONS[language.lower()]
        # Dosya yolunu oluşturur
        temp_file_path = os.path.join(temp_dir, file_name)
        # Kod içeriğini dosyaya yazdırır
        with open(temp_file_path, 'w', encoding='utf-8') as temp_file:
            temp_file.write(code)
        return temp_file_path

    ################ Geçişi olarak oluşturulan dosyaları ve klasörü siler ###############
    def cleanup_temp_files(self, temp_file: str):
        try:
            temp_dir = os.path.dirname(temp_file)
            for ext in ['.class', '.exe', '']:
                compiled_file = os.path.join(temp_dir, 'Main' + ext)
                if os.path.exists(compiled_file):
                    os.unlink(compiled_file)
            if os.path.exists(temp_file):
                os.unlink(temp_file)
            if os.path.exists(temp_dir):
                os.rmdir(temp_dir)
        except Exception as e:
            logger.error(f"Error cleaning up temporary files: {str(e)}")