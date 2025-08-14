"""
    JSONculateDBManager
    =================================================================
    Jsonculate işlemlerini ve sonuçlarını SQLite veritabanında saklayan ve 
    yöneten bir sınıftır. Kayıtların benzerliğini ölçerek tekrarlayan çalıştırmaları
    tespit edebilir ve cache mantığıyla mevcut veriyi çekerek jsonculate'in gereksiz 
    çalışmasını önler.

    Özellikler:
    - Veritabanı ve tablo oluşturma
    - Sistem bilgilerini alma
    - Benzer kayıt arama
    - Yeni kayıt ekleme
    - Database kayıtlarını alma
"""

import sqlite3
from typing import Dict, Any, List, Optional
import json
import hashlib
import psutil
import platform
from config.logging_config import setup_logger

logger = setup_logger('jsonculate_db')

################========== JSONculateDBManager ==========################
class JSONculateDBManager:
    def __init__(self, db_path: str = "../data/jsonculate-reports.db"):
        self.db_path = db_path
        self.init_db()

    ################ Database'i oluşturur ################
    def init_db(self):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS json_parsing_reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                repeat INTEGER NOT NULL,
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
                scale_threshold INTEGER NOT NULL DEFAULT 10000,
                cpu_model TEXT NOT NULL,
                cpu_count INTEGER NOT NULL,
                total_memory REAL NOT NULL,
                os_info TEXT NOT NULL
            )
            ''')
            
            conn.commit()
            logger.info("JSONculate database initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise
        finally:
            conn.close()

    ################ Execution raporunu veritabanına kaydeder ################
    def save_report(self, results: Dict[str, Any], json_input: str, scale_threshold: int = 10000):
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            sys_info = self._get_system_info()
            json_hash = self._calculate_json_hash(json_input, results['repeat'], scale_threshold)
            
            cursor.execute('''
            INSERT INTO json_parsing_reports 
            (repeat, json_input, json_hash, json_size, 
             json_emissions, json_duration,
             orjson_emissions, orjson_duration,
             ujson_emissions, ujson_duration,
             is_scaled, scale_threshold,
             cpu_model, cpu_count, total_memory, os_info)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                results['repeat'],
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
                scale_threshold,
                sys_info['cpu_model'],
                sys_info['cpu_count'],
                sys_info['total_memory'],
                sys_info['os_info']
            ))
            
            conn.commit()
            report_id = cursor.lastrowid
            logger.info(f"Saved JSON parsing report with ID: {report_id}")
            
        except Exception as e:
            logger.error(f"Error saving JSON parsing report: {str(e)}")
            raise
        finally:
            conn.close()

    ################ Database'de aynı hash'e sahip kayıt arar ################
    def get_existing_report(self, json_input: str, repeat: int, scale_threshold: int) -> Optional[Dict[str, Any]]:
        try:
            json_hash = self._calculate_json_hash(json_input, repeat, scale_threshold)
            
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if repeat <= scale_threshold:
                cursor.execute('''
                SELECT * FROM json_parsing_reports 
                WHERE json_hash = ? AND repeat = ? AND is_scaled = 0
                ORDER BY timestamp DESC LIMIT 1
                ''', (json_hash, repeat))
            else:
                cursor.execute('''
                SELECT * FROM json_parsing_reports 
                WHERE json_hash = ? AND repeat = ? AND scale_threshold = ? AND is_scaled = 1
                ORDER BY timestamp DESC LIMIT 1
                ''', (json_hash, repeat, scale_threshold))
            
            row = cursor.fetchone()

            if row:
                columns = [description[0] for description in cursor.description]
                result = dict(zip(columns, row))
                logger.info(f"Found existing report for JSON with {repeat} repetitions")
                return result

            logger.info(f"No existing report found for JSON with {repeat} repetitions")
            return None
            
        except Exception as e:
            logger.error(f"Error checking for existing report: {str(e)}")
            return None
        finally:
            conn.close()

    ################ JSON içeriği ve tekrar sayısından benzersiz bir hash oluşturur ################
    def _calculate_json_hash(self, json_input: str, repeat: int, scale_threshold: int) -> str:
        try:
            if repeat <= scale_threshold:
                combined = f"{json_input}{repeat}"
            else:
                combined = f"{json_input}{repeat}{scale_threshold}"
            
            hash_value = hashlib.sha256(combined.encode()).hexdigest()
            logger.debug(f"Calculated hash for JSON input: {hash_value[:8]}...")
            return hash_value
            
        except Exception as e:
            logger.error(f"Error calculating JSON hash: {str(e)}")
            raise

    ################ Database Kayıtlarını Döndürür ################
    def get_reports(self) -> List[Dict[str, Any]]:
        try:
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
            
            logger.info(f"Retrieved {len(results)} JSON parsing reports")
            return results
            
        except Exception as e:
            logger.error(f"Error getting JSON parsing reports: {str(e)}")
            return []
        finally:
            conn.close()

    ################ Sistem bilgilerini alır ################
    def _get_system_info(self) -> Dict[str, Any]:
        try:
            info = {
                'cpu_model': platform.processor() or 'Unknown',
                'cpu_count': psutil.cpu_count(),
                'total_memory': round(psutil.virtual_memory().total / (1024 ** 3), 2),  # GB cinsinden
                'os_info': f"{platform.system()} {platform.release()}"
            }
            logger.debug(f"Retrieved system info: {info}")
            return info
        except Exception as e:
            logger.error(f"Error getting system info: {str(e)}")
            raise