from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import tempfile
import subprocess
import time
from datetime import datetime
from codecarbon import EmissionsTracker
import logging
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.db_manager import save_execution_report, get_execution_reports, get_system_info, find_similar_execution
from data.init_db import init_db

app = Flask(__name__)
CORS(app)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Data storage
HISTORY_FILE = "data/code_history.json"

def ensure_data_directory():
    """Ensure the data directory exists"""
    os.makedirs("data", exist_ok=True)

def load_history():
    """Load history from JSON file"""
    try:
        with open(HISTORY_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_history(history):
    """Save history to JSON file"""
    ensure_data_directory()
    with open(HISTORY_FILE, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)

def create_temp_code_file(code, language, repeat=1):
    """Create a temporary file with the user's code wrapped in a loop"""
    extensions = {
        'python': '.py',
        'javascript': '.js',
        'java': '.java',
        'cpp': '.cpp',
        'c': '.c'
    }
    
    ext = extensions.get(language.lower(), '.txt')
    temp_file = tempfile.NamedTemporaryFile(mode='w', suffix=ext, delete=False, encoding='utf-8')
    
    # Add encoding header for Python files
    if language.lower() == 'python':
        temp_file.write('# -*- coding: utf-8 -*-\n')
    
    # Wrap the code in a loop based on language
    if language.lower() == 'python':
        temp_file.write(f'''
# Wrapped in loop for {repeat} iterations
for iteration in range({repeat}):
    print(f"=== Iteration {{iteration + 1}}/{repeat} ===")
{chr(10).join('    ' + line for line in code.split(chr(10)))}
    print("=" * 30)
''')
    elif language.lower() == 'javascript':
        temp_file.write(f'''
// Wrapped in loop for {repeat} iterations
for (let iteration = 0; iteration < {repeat}; iteration++) {{
    console.log(`=== Iteration ${{iteration + 1}}/{repeat} ===`);
{chr(10).join('    ' + line for line in code.split(chr(10)))}
    console.log("=".repeat(30));
}}
''')
    elif language.lower() == 'java':
        temp_file.write(f'''
public class Main {{
    public static void main(String[] args) {{
        // Wrapped in loop for {repeat} iterations
        for (int iteration = 0; iteration < {repeat}; iteration++) {{
            System.out.println("=== Iteration " + (iteration + 1) + "/{repeat} ===");
{chr(10).join('            ' + line for line in code.split(chr(10)))}
            System.out.println("=".repeat(30));
        }}
    }}
}}
''')
    elif language.lower() == 'cpp':
        temp_file.write(f'''
#include <iostream>
#include <string>

int main() {{
    // Wrapped in loop for {repeat} iterations
    for (int iteration = 0; iteration < {repeat}; iteration++) {{
        std::cout << "=== Iteration " << (iteration + 1) << "/{repeat} ===" << std::endl;
{chr(10).join('        ' + line for line in code.split(chr(10)))}
        std::cout << std::string(30, '=') << std::endl;
    }}
    return 0;
}}
''')
    elif language.lower() == 'c':
        temp_file.write(f'''
#include <stdio.h>
#include <string.h>

int main() {{
    // Wrapped in loop for {repeat} iterations
    for (int iteration = 0; iteration < {repeat}; iteration++) {{
        printf("=== Iteration %d/{repeat} ===\\n", iteration + 1);
{chr(10).join('        ' + line for line in code.split(chr(10)))}
        printf("%.*s\\n", 30, "==============================");
    }}
    return 0;
}}
''')
    else:
        temp_file.write(code)
    
    temp_file.close()
    return temp_file.name

def execute_code(file_path, language):
    """Execute the code file and measure emissions"""
    try:
        if language.lower() == 'python':
            cmd = ['python', file_path]
        elif language.lower() == 'javascript':
            cmd = ['node', file_path]
        elif language.lower() == 'java':
            # Compile and run Java
            class_name = os.path.basename(file_path).replace('.java', '')
            compile_cmd = ['javac', file_path]
            subprocess.run(compile_cmd, check=True)
            cmd = ['java', '-cp', os.path.dirname(file_path), class_name]
        elif language.lower() in ['cpp', 'c']:
            # Compile and run C/C++
            output_file = file_path.replace('.cpp', '').replace('.c', '')
            compile_cmd = ['g++', file_path, '-o', output_file] if language.lower() == 'cpp' else ['gcc', file_path, '-o', output_file]
            subprocess.run(compile_cmd, check=True)
            cmd = [output_file]
        else:
            raise ValueError(f"Unsupported language: {language}")
        
        # Execute with CodeCarbon tracking
        tracker = EmissionsTracker()
        tracker.start()
        
        start_time = time.time()
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30, encoding='utf-8')
        execution_time = time.time() - start_time
        
        emissions = tracker.stop()
        
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'execution_time': execution_time,
            'emissions': emissions,
            'return_code': result.returncode
        }
        
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Execution timeout (30 seconds)',
            'execution_time': 30,
            'emissions': 0,
            'return_code': -1
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'execution_time': 0,
            'emissions': 0,
            'return_code': -1
        }
    finally:
        # Clean up temporary files
        try:
            os.unlink(temp_file)
            if language.lower() in ['java', 'cpp', 'c']:
                # Clean up compiled files
                base_name = temp_file.replace('.java', '').replace('.cpp', '').replace('.c', '')
                for ext in ['.class', '.exe', '']:
                    compiled_file = base_name + ext
                    if os.path.exists(compiled_file):
                        os.unlink(compiled_file)
        except:
            pass

@app.route('/calculate', methods=['POST'])
def calculate_emissions():
    """Calculate carbon emissions for user-written code"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '')
        language = data.get('language', 'python')
        repeat = data.get('repeat', 1)
        
        if not code.strip():
            return jsonify({'error': 'No code provided'}), 400
        
        if repeat < 1 or repeat > 100:
            return jsonify({'error': 'Repeat count must be between 1 and 100'}), 400
        
        logger.info(f"Processing code execution: language={language}, repeat={repeat}")
        
        # Sistem bilgilerini al
        cpu_info, ram_info, os_info = get_system_info()
        
        # Benzer kod kontrolü yap
        has_similar, similar_record = find_similar_execution(
            code=code,
            language=language,
            cpu_model=cpu_info['model'] if cpu_info else None,
            total_ram=ram_info['total_gb'] if ram_info else None,
            execution_count=repeat
        )
        
        if has_similar:
            logger.info("Similar code execution found in database, returning cached results")
            
            # Önceki sonuçları kullan
            response_data = {
                'total_emissions': similar_record['total_carbon_emission'],
                'avg_emissions': similar_record['carbon_per_execution'],
                'total_execution_time': similar_record['execution_duration_seconds'],
                'avg_execution_time': similar_record['execution_duration_seconds'] / repeat if repeat > 0 else 0,
                'repeat': repeat,
                'successful_runs': repeat,  # Başarılı kayıtlar saklandığı için
                'failed_runs': 0,
                'language': language,
                'last_result': {
                    'success': True,
                    'stdout': '(Cached result from similar execution)',
                    'stderr': '',
                    'execution_time': similar_record['execution_duration_seconds'],
                    'emissions': similar_record['total_carbon_emission'],
                    'return_code': 0
                },
                'is_cached': True  # Frontend'e bilgi vermek için
            }
            
            return jsonify(response_data)
        
        # Benzer kod bulunamadıysa yeni analiz yap
        logger.info("No similar code found, proceeding with new analysis")
        
        total_emissions = 0
        total_execution_time = 0
        successful_runs = 0
        failed_runs = 0
        results = []
        
        # Create temporary file with user code wrapped in loop
        temp_file = create_temp_code_file(code, language, repeat)
        
        # Execute with CodeCarbon tracking
        tracker = EmissionsTracker()
        tracker.start()
        
        start_time = time.time()
        
        # Execute the code once (it already contains the loop)
        try:
            if language.lower() == 'python':
                cmd = ['python', temp_file]
            elif language.lower() == 'javascript':
                cmd = ['node', temp_file]
            elif language.lower() == 'java':
                # Compile and run Java
                class_name = os.path.basename(temp_file).replace('.java', '')
                compile_cmd = ['javac', temp_file]
                subprocess.run(compile_cmd, check=True)
                cmd = ['java', '-cp', os.path.dirname(temp_file), class_name]
            elif language.lower() in ['cpp', 'c']:
                # Compile and run C/C++
                output_file = temp_file.replace('.cpp', '').replace('.c', '')
                compile_cmd = ['g++', temp_file, '-o', output_file] if language.lower() == 'cpp' else ['gcc', temp_file, '-o', output_file]
                subprocess.run(compile_cmd, check=True)
                cmd = [output_file]
            else:
                raise ValueError(f"Unsupported language: {language}")
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30, encoding='utf-8')
            
            if result.returncode == 0:
                successful_runs = repeat
                logger.info(f"Code executed successfully with {repeat} iterations")
            else:
                failed_runs = repeat
                logger.info(f"Code failed with return code: {result.returncode}")
            
        except subprocess.TimeoutExpired:
            failed_runs = repeat
            logger.info("Code execution timed out")
        except Exception as e:
            failed_runs = repeat
            logger.info(f"Code failed with error: {str(e)}")
        
        execution_time = time.time() - start_time
        emissions = tracker.stop()
        
        # Create result object
        result = {
            'success': successful_runs > 0,
            'stdout': result.stdout if 'result' in locals() else '',
            'stderr': result.stderr if 'result' in locals() else str(e) if 'e' in locals() else '',
            'execution_time': execution_time,
            'emissions': emissions,
            'return_code': result.returncode if 'result' in locals() else -1
        }
        
        results.append(result)
        
        total_emissions = emissions
        total_execution_time = execution_time
        
        # Calculate averages
        avg_emissions = total_emissions / repeat if repeat > 0 else 0
        avg_execution_time = total_execution_time / repeat if repeat > 0 else 0
        
        # Create response data
        response_data = {
            'total_emissions': total_emissions,
            'avg_emissions': avg_emissions,
            'total_execution_time': total_execution_time,
            'avg_execution_time': avg_execution_time,
            'repeat': repeat,
            'successful_runs': successful_runs,
            'failed_runs': failed_runs,
            'language': language,
            'last_result': results[-1] if results else None,
            'is_cached': False
        }
        
        # Save to history
        history = load_history()
        history_entry = {
            'timestamp': datetime.now().isoformat(),
            'language': language,
            'repeat': repeat,
            'total_emissions': total_emissions,
            'avg_emissions': avg_emissions,
            'successful_runs': successful_runs,
            'failed_runs': failed_runs,
            'code_preview': code[:100] + '...' if len(code) > 100 else code
        }
        
        history.append(history_entry)
        # Keep only last 50 entries
        history = history[-50:]
        save_history(history)

        # Başarılı çalıştırma sonuçlarını veritabanına kaydet
        if successful_runs > 0:
            try:
                # CodeCarbon'dan gelen verileri hazırla
                codecarbon_data = tracker.final_emissions_data if hasattr(tracker, 'final_emissions_data') else {}
                
                # Veritabanına kaydet
                save_execution_report(
                    programming_language=language,
                    execution_count=repeat,
                    total_carbon_emission=total_emissions,
                    execution_duration=total_execution_time,
                    codecarbon_data=codecarbon_data,
                    code_text=code
                )
                logger.info("Execution report saved to database successfully")
            except Exception as e:
                logger.error(f"Error saving to database: {str(e)}")
                logger.error("Stack trace:", exc_info=True)
        
        # Log the calculation
        logger.info(f"Calculation completed: total_emissions={total_emissions}, avg_emissions={avg_emissions}")
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in calculate_emissions: {str(e)}")
        return jsonify({'error': f'Calculation failed: {str(e)}'}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get calculation history from SQL database"""
    try:
        reports = get_execution_reports()
        logger.info(f"Retrieved {len(reports)} reports from database")
        logger.info(f"First report preview: {reports[0] if reports else None}")
        return jsonify(reports)
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}")
        logger.error("Stack trace:", exc_info=True)
        return jsonify([])

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'code-carbon-tracker'
    })

if __name__ == '__main__':
    ensure_data_directory()
    
    # Initialize database
    try:
        init_db()
        print("✅ Database initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        sys.exit(1)
    
    print("🚀 CodeCarbon Backend Server starting...")
    print("📊 Endpoints:")
    print("   POST /calculate - Calculate code emissions")
    print("   GET  /history   - Get calculation history")
    print("   GET  /health    - Health check")
    print(f"🌍 Server running on: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
