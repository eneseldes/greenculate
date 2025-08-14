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

################========== JSONculateDBManager ==========################
class JSONculateDBManager:
    def __init__(self, db_path: str = "../data/jsonculate-reports.db"):
        self.db_path = db_path
        self.init_db()

    ################ Database'i oluşturur ################
    def init_db(self):
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
        conn.close()

    ################ Execution raporunu veritabanına kaydeder ################
    def save_report(self, results: Dict[str, Any], json_input: str, scale_threshold: int = 10000):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sistem bilgilerini al
        sys_info = self._get_system_info()
        
        # JSON hash'ini hesapla
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
        conn.close()

    ################ Database'de aynı hash'e sahip kayıt arar ################
    def get_existing_report(self, json_input: str, repeat: int, scale_threshold: int) -> Optional[Dict[str, Any]]:
        json_hash = self._calculate_json_hash(json_input, repeat, scale_threshold)
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if repeat <= scale_threshold:
            # Ölçeklendirme yapılmayacaksa, is_scaled=0 olan ve aynı hash'e sahip kayıtları ara
            cursor.execute('''
            SELECT * FROM json_parsing_reports 
            WHERE json_hash = ? AND repeat = ? AND is_scaled = 0
            ORDER BY timestamp DESC LIMIT 1
            ''', (json_hash, repeat))
        else:
            # Ölçeklendirme yapılacaksa, tam eşleşme ara
            cursor.execute('''
            SELECT * FROM json_parsing_reports 
            WHERE json_hash = ? AND repeat = ? AND scale_threshold = ? AND is_scaled = 1
            ORDER BY timestamp DESC LIMIT 1
            ''', (json_hash, repeat, scale_threshold))
        
        # Verileri al ve ilk satırı row'da tut
        row = cursor.fetchone()

        # Row var ise aradığımız veri bulunmuş demektir
        if row:
            columns = [description[0] for description in cursor.description]
            result = dict(zip(columns, row))
        else:
            result = None
        
        # Buraya gelindi ise ilgili row bulunamamıştır. Return false
        conn.close()
        return result

    ################ JSON içeriği ve tekrar sayısından benzersiz bir hash oluşturur ################
    def _calculate_json_hash(self, json_input: str, repeat: int, scale_threshold: int) -> str:
        # Mantıksal karar ÖNEMLİ!
            # repeat değeri scale_threshold’dan küçük veya eşitse:
            #   → JSON gerçek tekrar sayısı kadar parse edilmiştir. (is_scaled = 0)
            #   → Ölçeklendirme yapılmamış kayıt aranır.
            # repeat değeri scale_threshold’dan büyükse:
            #   → JSON sadece scale_threshold kadar parse edilip sonuçlar ölçeklendirilmiştir (is_scaled = 1)
            #   → Aynı scale_threshold ile kaydedilmiş ölçekli kayıt aranır.
            #
            ###!!! Özetle: 10 milyon tekrarlı ama ölçeklenmiş bir sonuç ile 10 milyon kez 
            ###!!! gerçekten çalıştırılmış bir sonucu birbirine karıştırılmaması için
            ###!!! ayrım
        if repeat <= scale_threshold:
            # Ölçeklendirme yapılmayacaksa sadece input ve repeat kullan
            combined = f"{json_input}{repeat}"
        else:
            # Ölçeklendirme yapılacaksa scale_threshold'u da dahil et
            combined = f"{json_input}{repeat}{scale_threshold}"
        return hashlib.sha256(combined.encode()).hexdigest()

    ################ Database Kayıtlarını Döndürür ################
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

    ################ Sistem bilgilerini alır ################
    def _get_system_info(self) -> Dict[str, Any]:
        return {
            'cpu_model': platform.processor() or 'Unknown',
            'cpu_count': psutil.cpu_count(),
            'total_memory': round(psutil.virtual_memory().total / (1024 ** 3), 2),  # GB cinsinden
            'os_info': f"{platform.system()} {platform.release()}"
        }