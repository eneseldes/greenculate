from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime
import logging
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from code_execution import process_code_execution, get_execution_history, init_db as init_code_db
from json_parsing.json_parser import JSONParser
from json_parsing.db_manager import DBManager as JsonDBManager

app = Flask(__name__)
CORS(app)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        
        try:
            response_data = process_code_execution(code, language, repeat)
            return jsonify(response_data)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        logger.error(f"Error in calculate_emissions: {str(e)}")
        return jsonify({'error': f'Calculation failed: {str(e)}'}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get calculation history from SQL database"""
    try:
        reports = get_execution_history()
        return jsonify(reports)
    except Exception as e:
        logger.error(f"Error getting history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

@app.route('/request', methods=['POST'])
def make_request():
    """HTTP isteği gönder"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        method = data.get('method', 'GET')
        url = data.get('url')
        headers = data.get('headers', {})
        body = data.get('body')
        library = data.get('library', 'requests')
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # HTTP client oluştur
        client = create_client(library)
        
        # İsteği gönder
        try:
            response = client.send_request(method, url, headers, body)
            return jsonify(response)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': f'Request failed: {str(e)}'}), 500
        
    except Exception as e:
        logger.error(f"Error in make_request: {str(e)}")
        return jsonify({'error': f'Request failed: {str(e)}'}), 500

@app.route('/request/history', methods=['GET'])
def get_request_history():
    """HTTP istek geçmişini getir"""
    try:
        reports = get_request_reports()
        return jsonify(reports)
    except Exception as e:
        logger.error(f"Error getting request history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

@app.route('/request/stats', methods=['GET'])
def get_request_statistics():
    """HTTP istek istatistiklerini getir"""
    try:
        stats = get_request_stats()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Error getting request stats: {str(e)}")
        return jsonify({'error': f'Failed to get stats: {str(e)}'}), 500

@app.route('/parse-json', methods=['POST'])
def parse_json():
    """Parse JSON with different libraries and measure emissions"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        json_str = data.get('json', '')
        iterations = data.get('iterations', 1)
        
        if not json_str:
            return jsonify({'error': 'JSON string is required'}), 400
            
        parser = JSONParser()
        try:
            result = parser.parse_json(json_str, iterations, db_manager=json_db)
            return jsonify(result)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        
    except Exception as e:
        logger.error(f"Error in parse_json: {str(e)}")
        return jsonify({'error': f'Parsing failed: {str(e)}'}), 500

@app.route('/parse-json/history', methods=['GET'])
def get_parse_history():
    """Get JSON parsing history"""
    try:
        reports = json_db.get_reports()
        return jsonify(reports)
    except Exception as e:
        logger.error(f"Error getting parse history: {str(e)}")
        return jsonify({'error': f'Failed to get history: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'code-carbon-tracker'
    })

if __name__ == '__main__':
    # Initialize databases
    try:
        init_code_db()
        json_db = JsonDBManager()
        print("✅ Databases initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing databases: {str(e)}")
        sys.exit(1)
    
    print("🚀 Backend Server starting...")
    print("📊 Endpoints:")
    print("Code Execution:")
    print("   POST /calculate      - Calculate code emissions")
    print("   GET  /history       - Get calculation history")
    print("\nHTTP Requests:")
    print("   POST /request       - Make HTTP request")
    print("   GET  /request/history - Get request history")
    print("   GET  /request/stats   - Get request statistics")
    print("\nSystem:")
    print("   GET  /health        - Health check")
    print(f"🌍 Server running on: http://localhost:5000")
    
    app.run(host='0.0.0.0', port=5000, debug=True)