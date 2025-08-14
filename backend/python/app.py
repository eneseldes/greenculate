"""
    PYTHON BACKEND
    =================================================================
    Flask tabanlı bu backend, codeculate ve jsonculate için API'leri sunar.
    Codeculate: Kodun karbon salınımını ölçer.
    Jsonculate: JSON'un parse edilmesi için kullanılır.
"""

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import logging
import sys
from codeculate.codeculate_db_manager import CodeculateDBManager
from jsonculate.jsonculate_db_manager import JSONculateDBManager
from codeculate.code_executor import CodeExecutor
from jsonculate.json_parser import JSONParser

app = Flask(__name__)
CORS(app)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

################ Codeculate Route'ları ################
@app.route('/codeculate/execute', methods=['POST'])
def calculate_emissions():
    """Calculate carbon emissions for user-written code"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        code = data.get('code', '')
        language = data.get('language', 'python')
        repeat = data.get('repeat', 1)
        scale_threshold = data.get('scaleThreshold', 10000)
        
        try:
            executor = CodeExecutor()
            result = executor.process(code, language, repeat, scale_threshold, timeout=30, db_manager=codeculate_db)
            return jsonify(result)

        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        logger.error(f"Error in calculate_emissions: {str(e)}")
        return jsonify({'error': f'Calculation failed: {str(e)}'}), 500

@app.route('/codeculate/history', methods=['GET'])
def get_history():
    """Get calculation history from SQL database"""
    try:
        return jsonify(codeculate_db.get_reports())
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

################ JSONculate Route'ları ################
@app.route('/jsonculate/execute', methods=['POST'])
def parse_json():
    """Parse JSON with different libraries and measure emissions"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        json_str = data.get('json', '')
        repeat = data.get('repeat', 1)
        scale_threshold = data.get('scaleThreshold', 10000)
        
        if not json_str:
            return jsonify({'error': 'JSON string is required'}), 400
            
        parser = JSONParser()
        try:
            result = parser.parse_json(json_str, repeat, scale_threshold=scale_threshold, db_manager=jsonculate_db)
            return jsonify(result)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        logger.error(f"Error in parse_json: {str(e)}")
        return jsonify({'error': f'Parsing failed: {str(e)}'}), 500

@app.route('/jsonculate/history', methods=['GET'])
def get_parse_history():
    """Get JSON parsing history"""
    try:
        return jsonify(jsonculate_db.get_reports())
    except Exception as e:
        logger.error(f"Error getting parse history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

################ Main ################
if __name__ == '__main__':
    try:
        codeculate_db = CodeculateDBManager()
        jsonculate_db = JSONculateDBManager()
        print("✅ Databases initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing databases: {str(e)}")
        sys.exit(1)
    
    print(f"🌍 Server running on: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)