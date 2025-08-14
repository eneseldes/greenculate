"""
    CodeculateDBManager
    =================================================================
    Codeculate işlemlerini ve sonuçlarını SQLite veritabanında saklayan ve 
    yöneten bir sınıftır. Kayıtların benzerliğini ölçerek tekrarlayan çalıştırmaları
    tespit edebilir ve cache mantığıyla mevcut veriyi çekerek codeculate'in gereksiz 
    çalışmasını önler.

    Özellikler:
    - Veritabanı ve tablo oluşturma
    - Sistem bilgilerini alma
    - Benzer kayıt arama
    - Yeni kayıt ekleme
    - Database kayıtlarını alma
"""

import sqlite3
import os
import platform
import psutil
from typing import Dict, Any, List, Optional, Tuple
from .normalize_and_compare import normalize

################========== CodeculateDBManager ==========################
class CodeculateDBManager:
    def __init__(self, db_path: str = "../data/codeculate-reports.db"):
        self.db_path = db_path
        self.init_db()

    ################ Database'i oluşturur ################
    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        cursor.execute('''
        CREATE TABLE IF NOT EXISTS execution_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            execution_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            programming_language TEXT NOT NULL,
            execution_count INTEGER NOT NULL,
            total_carbon_emission REAL NOT NULL,
            carbon_per_execution REAL NOT NULL,
            execution_duration_seconds REAL NOT NULL,
            cpu_model TEXT,
            cpu_count INTEGER,
            cpu_usage_percent REAL,
            total_ram_gb REAL,
            ram_usage_percent REAL,
            os_name TEXT,
            os_version TEXT,
            code_text TEXT NOT NULL,
            normalized_code TEXT NOT NULL,
            is_scaled BOOLEAN NOT NULL DEFAULT 0,
            scale_threshold INTEGER NOT NULL DEFAULT 10000
        )
        ''')

        conn.commit()
        conn.close()

    ################ Execution raporunu veritabanına kaydeder ################
    def save_report(
        self,
        programming_language: str,
        execution_count: int,
        total_carbon_emission: float,
        execution_duration: float,
        code_text: str,
        is_scaled: bool = False,
        scale_threshold: int = 10000
    ) -> int:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            sys_info = self._get_system_info()

            # Çalıştırma başına emisyonu hesapla
            carbon_per_execution = total_carbon_emission / execution_count if execution_count > 0 else 0

            # Verileri database'e kaydet
            cursor.execute('''
            INSERT INTO execution_reports (
                programming_language,
                execution_count,
                total_carbon_emission,
                carbon_per_execution,
                execution_duration_seconds,
                cpu_model,
                cpu_count,
                cpu_usage_percent,
                total_ram_gb,
                ram_usage_percent,
                os_name,
                os_version,
                code_text,
                normalized_code,
                is_scaled,
                scale_threshold
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                programming_language,
                execution_count,
                total_carbon_emission,
                carbon_per_execution,
                execution_duration,
                sys_info.get('cpu_model'),
                sys_info.get('cpu_count'),
                sys_info.get('cpu_usage_percent'),
                sys_info.get('total_ram_gb'),
                sys_info.get('ram_usage_percent'),
                sys_info.get('os_name'),
                sys_info.get('os_version'),
                code_text,
                normalize(code_text, programming_language),
                is_scaled,
                scale_threshold
            ))

            conn.commit()
            return cursor.lastrowid

        # Hata yönetimi
        except Exception as e:
            print(f"Error saving execution report: {e}")
            raise
        finally:
            conn.close()

    ################ Benzer execution kaydı olup olmadığını kontrol eder ################
    # Return değeri: (bool, dict) = (benzer kayıt var mı?, benzer kayıt var ise ilgili kayıtın kendisi)
    ### Karşılaştırma verileri: normalize edilmiş kod, tekrar sayısı, sistem bilgileri, ölçeklendirme eşiği
    def get_existing_report(
        self,
        code: str,
        language: str,
        execution_count: int,
        scale_threshold: int = 10000
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        sys_info = self._get_system_info()

        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
        
            normalized_new_code = normalize(code, language)
            
            # Mantıksal karar ÖNEMLİ!
            # execution_count değeri scale_threshold’dan küçük veya eşitse:
            #   → Kod gerçek tekrar sayısı kadar çalıştırılmıştır (is_scaled = 0)
            #   → Ölçeklendirme yapılmamış kayıt aranır.
            # execution_count değeri scale_threshold’dan büyükse:
            #   → Kod sadece scale_threshold kadar çalıştırılıp sonuçlar ölçeklendirilmiştir (is_scaled = 1)
            #   → Aynı scale_threshold ile kaydedilmiş ölçekli kayıt aranır.
            #
            ###!!! Özetle: 10 milyon tekrarlı ama ölçeklenmiş bir sonuç ile 10 milyon kez 
            ###!!! gerçekten çalıştırılmış bir sonucu birbirine karıştırılmaması için
            ###!!! ayrım
            if execution_count <= scale_threshold:
                query = '''
                SELECT * FROM execution_reports 
                WHERE programming_language = ?
                AND execution_count = ?
                AND cpu_model = ?
                AND total_ram_gb = ?
                AND normalized_code = ?
                AND is_scaled = 0
                ORDER BY execution_time DESC
                LIMIT 1
                '''
                params = [language, execution_count, sys_info['cpu_model'], sys_info['total_ram_gb'], normalized_new_code]
            else:
                query = '''
                SELECT * FROM execution_reports 
                WHERE programming_language = ?
                AND execution_count = ?
                AND cpu_model = ?
                AND total_ram_gb = ?
                AND normalized_code = ?
                AND is_scaled = 1
                AND scale_threshold = ?
                ORDER BY execution_time DESC
                LIMIT 1
                '''
                params = [language, execution_count, sys_info['cpu_model'], sys_info['total_ram_gb'], normalized_new_code, scale_threshold]

            # Verileri al ve ilk satırı row'da tut
            cursor.execute(query, params)
            row = cursor.fetchone()

            # Row var ise aradığımız veri bulunmuş demektir
            if row:
                columns = [desc[0] for desc in cursor.description]
                return True, dict(zip(columns, row))

            # Buraya gelindi ise ilgili row bulunamamıştır. Return false
            return False, None

        # Hata yönetimi
        except Exception as e:
            print(f"Error checking similar execution: {e}")
            return False, None
        finally:
            conn.close()

    ################ Database Kayıtlarını Döndürür ################
    def get_reports(self) -> List[Dict[str, Any]]:
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()

            cursor.execute(f'''
            SELECT * FROM execution_reports
            ORDER BY execution_time DESC
            ''')

            # Columns'ı döndür
            columns = [desc[0] for desc in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Hata yönetimi
        except Exception as e:
            print(f"Error getting execution reports: {e}")
            return []
        finally:
            conn.close()

    ################ Sistem bilgilerini alır ################
    def _get_system_info(self) -> Dict[str, Any]:
        try:
            return {
                'cpu_model': platform.processor() or 'Unknown',
                'cpu_count': psutil.cpu_count(),
                'cpu_usage_percent': psutil.cpu_percent(interval=1),
                'total_ram_gb': round(psutil.virtual_memory().total / (1024 ** 3), 2),
                'ram_usage_percent': psutil.virtual_memory().percent,
                'os_name': platform.system(),
                'os_version': platform.version()
            }
        except Exception as e:
            print(f"Error getting system info: {e}")
            return {}