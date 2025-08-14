"""
    PYTHON BACKEND
    =================================================================
    Flask tabanlı bu backend, codeculate ve jsonculate için API'leri sunar.
    Codeculate: Kodun karbon salınımını ölçer.
    Jsonculate: JSON'un parse edilmesi için kullanılır.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from codeculate.codeculate_db_manager import CodeculateDBManager
from jsonculate.jsonculate_db_manager import JSONculateDBManager
from codeculate.code_executor import CodeExecutor
from jsonculate.json_parser import JSONParser
from config.logging_config import setup_logger

app = Flask(__name__)
CORS(app)

# Logger setup
logger = setup_logger('app')

################ Total Emission Route'u ################
@app.route('/total-emission', methods=['GET'])
def get_total_emissions():
    try:
        # Code emisyonu
        code_reports = codeculate_db.get_reports()
        total_code_emissions = sum(report['total_carbon_emission'] for report in code_reports)

        # JSON emisyonu
        json_reports = jsonculate_db.get_reports()
        total_json_emissions = sum(
            report['json_emissions'] + 
            report['orjson_emissions'] + 
            report['ujson_emissions'] 
            for report in json_reports
        )
        
        logger.info(f"Total emissions calculated - Code: {total_code_emissions}, JSON: {total_json_emissions}")
        return jsonify({
            'code_emissions': total_code_emissions,
            'json_emissions': total_json_emissions
        })
    except Exception as e:
        logger.error(f"Error in get_total_emissions: {str(e)}")
        return jsonify({'error': f'Failed to get total emissions: {str(e)}'}), 500

################ Codeculate Route'ları ################
@app.route('/codeculate/execute', methods=['POST'])
def calculate_emissions():
    """Calculate carbon emissions for user-written code"""
    try:
        data = request.get_json()
        
        if not data:
            logger.warning("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '')
        language = data.get('language', 'python')
        repeat = data.get('repeat', 1)
        scale_threshold = data.get('scaleThreshold', 10000)
        
        logger.info(f"Calculating emissions for {language} code with {repeat} repetitions")
        
        try:
            executor = CodeExecutor()
            result = executor.process(code, language, repeat, scale_threshold, timeout=30, db_manager=codeculate_db)
            logger.info(f"Emission calculation completed successfully")
            return jsonify(result)

        except ValueError as e:
            logger.warning(f"Invalid input for emission calculation: {str(e)}")
            return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        logger.error(f"Error in calculate_emissions: {str(e)}")
        return jsonify({'error': f'Calculation failed: {str(e)}'}), 500

@app.route('/codeculate/history', methods=['GET'])
def get_history():
    """Get calculation history from SQL database"""
    try:
        logger.info("Fetching codeculate history")
        return jsonify(codeculate_db.get_reports())
    except Exception as e:
        logger.error(f"Failed to get codeculate history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

################ JSONculate Route'ları ################
@app.route('/jsonculate/execute', methods=['POST'])
def parse_json():
    """Parse JSON with different libraries and measure emissions"""
    try:
        data = request.get_json()
        
        if not data:
            logger.warning("No data provided in request")
            return jsonify({'error': 'No data provided'}), 400
        
        json_str = data.get('json', '')
        repeat = data.get('repeat', 1)
        scale_threshold = data.get('scaleThreshold', 10000)
        
        if not json_str:
            logger.warning("Empty JSON string provided")
            return jsonify({'error': 'JSON string is required'}), 400
        
        logger.info(f"Parsing JSON with {repeat} repetitions")
            
        parser = JSONParser()
        try:
            result = parser.parse_json(json_str, repeat, scale_threshold=scale_threshold, db_manager=jsonculate_db)
            logger.info("JSON parsing completed successfully")
            return jsonify(result)
        except ValueError as e:
            logger.warning(f"Invalid JSON input: {str(e)}")
            return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        logger.error(f"Error in parse_json: {str(e)}")
        return jsonify({'error': f'Parsing failed: {str(e)}'}), 500

@app.route('/jsonculate/history', methods=['GET'])
def get_parse_history():
    """Get JSON parsing history"""
    try:
        logger.info("Fetching jsonculate history")
        return jsonify(jsonculate_db.get_reports())
    except Exception as e:
        logger.error(f"Failed to get jsonculate history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

################ Main ################
if __name__ == '__main__':
    try:
        codeculate_db = CodeculateDBManager()
        jsonculate_db = JSONculateDBManager()
        logger.info("✅ Databases initialized successfully")
    except Exception as e:
        logger.error(f"❌ Error initializing databases: {str(e)}")
        sys.exit(1)
    
    logger.info(f"🌍 Server running on: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)