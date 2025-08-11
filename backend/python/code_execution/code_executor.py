import os
import tempfile
import subprocess
import time
from codecarbon import EmissionsTracker
import logging
from datetime import datetime
from .db_manager import save_execution_report, get_execution_reports, get_system_info, find_similar_execution

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def execute_code_file(temp_file, language):
    """Execute the code file and return execution details"""
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
        return result

    except subprocess.TimeoutExpired as e:
        logger.error("Code execution timed out")
        raise
    except Exception as e:
        logger.error(f"Error executing code: {str(e)}")
        raise

def cleanup_temp_files(temp_file, language):
    """Clean up temporary and compiled files"""
    try:
        os.unlink(temp_file)
        if language.lower() in ['java', 'cpp', 'c']:
            # Clean up compiled files
            base_name = temp_file.replace('.java', '').replace('.cpp', '').replace('.c', '')
            for ext in ['.class', '.exe', '']:
                compiled_file = base_name + ext
                if os.path.exists(compiled_file):
                    os.unlink(compiled_file)
    except Exception as e:
        logger.error(f"Error cleaning up temporary files: {str(e)}")

def execute_code_with_tracking(code, language, repeat=1):
    """Execute code with emissions tracking and return results"""
    temp_file = None
    try:
        # Create temporary file
        temp_file = create_temp_code_file(code, language, repeat)
        
        # Start emissions tracking
        tracker = EmissionsTracker()
        tracker.start()
        
        # Execute code and measure time
        start_time = time.time()
        result = execute_code_file(temp_file, language)
        execution_time = time.time() - start_time
        
        # Stop emissions tracking
        emissions = tracker.stop()
        
        # Prepare result object
        execution_result = {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'execution_time': execution_time,
            'emissions': emissions,
            'return_code': result.returncode,
            'tracker_data': tracker.final_emissions_data if hasattr(tracker, 'final_emissions_data') else {}
        }
        
        return execution_result

    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Execution timeout (30 seconds)',
            'execution_time': 30,
            'emissions': 0,
            'return_code': -1,
            'tracker_data': {}
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'execution_time': 0,
            'emissions': 0,
            'return_code': -1,
            'tracker_data': {}
        }
    finally:
        if temp_file:
            cleanup_temp_files(temp_file, language)

def process_code_execution(code, language, repeat=1):
    """Process code execution with caching and database storage"""
    if not code.strip():
        raise ValueError('No code provided')
    
    if repeat < 1 or repeat > 100:
        raise ValueError('Repeat count must be between 1 and 100')
    
    logger.info(f"Processing code execution: language={language}, repeat={repeat}")
    
    # Get system info
    cpu_info, ram_info, os_info = get_system_info()
    
    # Check for similar code
    has_similar, similar_record = find_similar_execution(
        code=code,
        language=language,
        cpu_model=cpu_info['model'] if cpu_info else None,
        total_ram=ram_info['total_gb'] if ram_info else None,
        execution_count=repeat
    )
    
    if has_similar:
        logger.info("Similar code execution found in database, returning cached results")
        return {
            'total_emissions': similar_record['total_carbon_emission'],
            'avg_emissions': similar_record['carbon_per_execution'],
            'total_execution_time': similar_record['execution_duration_seconds'],
            'avg_execution_time': similar_record['execution_duration_seconds'] / repeat if repeat > 0 else 0,
            'repeat': repeat,
            'successful_runs': repeat,
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
            'is_cached': True
        }
    
    logger.info("No similar code found, proceeding with new analysis")
    
    # Execute code with tracking
    execution_result = execute_code_with_tracking(code, language, repeat)
    
    # Calculate statistics
    total_emissions = execution_result['emissions']
    total_execution_time = execution_result['execution_time']
    successful_runs = repeat if execution_result['success'] else 0
    failed_runs = 0 if execution_result['success'] else repeat
    
    # Calculate averages
    avg_emissions = total_emissions / repeat if repeat > 0 else 0
    avg_execution_time = total_execution_time / repeat if repeat > 0 else 0
    
    # Save successful executions to database
    if successful_runs > 0:
        try:
            save_execution_report(
                programming_language=language,
                execution_count=repeat,
                total_carbon_emission=total_emissions,
                execution_duration=total_execution_time,
                codecarbon_data=execution_result['tracker_data'],
                code_text=code
            )
            logger.info("Execution report saved to database successfully")
        except Exception as e:
            logger.error(f"Error saving to database: {str(e)}")
            logger.error("Stack trace:", exc_info=True)
    
    # Log completion
    logger.info(f"Calculation completed: total_emissions={total_emissions}, avg_emissions={avg_emissions}")
    
    return {
        'total_emissions': total_emissions,
        'avg_emissions': avg_emissions,
        'total_execution_time': total_execution_time,
        'avg_execution_time': avg_execution_time,
        'repeat': repeat,
        'successful_runs': successful_runs,
        'failed_runs': failed_runs,
        'language': language,
        'last_result': execution_result,
        'is_cached': False
    }

def get_execution_history():
    """Get execution history from database with logging"""
    try:
        reports = get_execution_reports()
        logger.info(f"Retrieved {len(reports)} reports from database")
        logger.info(f"First report preview: {reports[0] if reports else None}")
        return reports
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}")
        logger.error("Stack trace:", exc_info=True)
        return []
