import sqlite3
from typing import Dict, Any, List, Optional
import json
import hashlib
import psutil
import platform

class DBManager:
    def __init__(self, db_path: str = "../data/json-parsing-reports.db"):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS json_parsing_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            iterations INTEGER NOT NULL,
            json_input TEXT NOT NULL,
            json_hash TEXT NOT NULL,
            json_size INTEGER NOT NULL,
            json_emissions REAL NOT NULL,
            json_duration REAL NOT NULL,
            orjson_emissions REAL NOT NULL,
            orjson_duration REAL NOT NULL,
            ujson_emissions REAL NOT NULL,
            ujson_duration REAL NOT NULL,
            is_scaled BOOLEAN NOT NULL DEFAULT 0,
            cpu_model TEXT NOT NULL,
            cpu_count INTEGER NOT NULL,
            total_memory REAL NOT NULL,
            os_info TEXT NOT NULL
        )
        ''')
        
        conn.commit()
        conn.close()

    def _get_system_info(self) -> Dict[str, Any]:
        return {
            'cpu_model': platform.processor() or 'Unknown',
            'cpu_count': psutil.cpu_count(),
            'total_memory': round(psutil.virtual_memory().total / (1024 ** 3), 2),  # GB cinsinden
            'os_info': f"{platform.system()} {platform.release()}"
        }

    def _calculate_json_hash(self, json_input: str, iterations: int) -> str:
        """JSON içeriği ve tekrar sayısından benzersiz bir hash oluşturur"""
        combined = f"{json_input}{iterations}"
        return hashlib.sha256(combined.encode()).hexdigest()

    def get_existing_report(self, json_input: str, iterations: int) -> Optional[Dict[str, Any]]:
        """Aynı JSON ve tekrar sayısı için önceki raporu döndürür"""
        json_hash = self._calculate_json_hash(json_input, iterations)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM json_parsing_reports 
        WHERE json_hash = ? AND iterations = ?
        ORDER BY timestamp DESC LIMIT 1
        ''', (json_hash, iterations))
        
        row = cursor.fetchone()
        if row:
            columns = [description[0] for description in cursor.description]
            result = dict(zip(columns, row))
        else:
            result = None
        
        conn.close()
        return result

    def save_report(self, results: Dict[str, Any], json_input: str):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sistem bilgilerini al
        sys_info = self._get_system_info()
        
        # JSON hash'ini hesapla
        json_hash = self._calculate_json_hash(json_input, results['iterations'])
        
        cursor.execute('''
        INSERT INTO json_parsing_reports 
        (iterations, json_input, json_hash, json_size, 
         json_emissions, json_duration,
         orjson_emissions, orjson_duration,
         ujson_emissions, ujson_duration,
         is_scaled, cpu_model, cpu_count, total_memory, os_info)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            results['iterations'],
            json_input,
            json_hash,
            len(json_input),
            results['json']['emissions'],
            results['json']['duration'],
            results['orjson']['emissions'],
            results['orjson']['duration'],
            results['ujson']['emissions'],
            results['ujson']['duration'],
            results.get('scaled', False),
            sys_info['cpu_model'],
            sys_info['cpu_count'],
            sys_info['total_memory'],
            sys_info['os_info']
        ))
        
        conn.commit()
        conn.close()

    def get_reports(self) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM json_parsing_reports 
        ORDER BY timestamp DESC
        ''')
        
        columns = [description[0] for description in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        conn.close()
        return results
