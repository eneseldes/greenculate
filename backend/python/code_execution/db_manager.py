# Mevcut db_manager.py içeriği
import sqlite3
import os
import platform
import psutil
import sys
from difflib import SequenceMatcher
import re


DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data', 'code-execution-reports.db')

def normalize_code(code):
    """Kodu normalize eder (boşlukları ve gereksiz karakterleri temizler)"""
    # Yorum satırlarını kaldır
    code = re.sub(r'#.*$|//.*$|/\*[\s\S]*?\*/', '', code, flags=re.MULTILINE)
    # Boş satırları kaldır
    code = re.sub(r'\n\s*\n', '\n', code)
    # Satır başı ve sonu boşlukları temizle
    code = '\n'.join(line.strip() for line in code.splitlines())
    # Ardışık boşlukları tek boşluğa indir
    code = re.sub(r'\s+', ' ', code)
    return code.strip()

def find_similar_execution(code, language, cpu_model, total_ram, execution_count, similarity_threshold=0.85):
    """Veritabanında benzer kod ve sistem özellikleri olup olmadığını kontrol eder"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Temel sorgu oluştur
        query = '''
        SELECT * FROM execution_reports 
        WHERE programming_language = ?
        AND execution_count = ?
        AND cpu_model = ?
        AND total_ram_gb = ?
        '''
        params = [language, execution_count, cpu_model, total_ram]

        # Sorguyu çalıştır
        cursor.execute(query, params)
        
        matching_records = cursor.fetchall()
        columns = [description[0] for description in cursor.description]
        
        # Gelen kodu normalize et
        normalized_new_code = normalize_code(code)
        
        # Her bir eşleşen kayıt için kod benzerliğini kontrol et
        for record in matching_records:
            record_dict = dict(zip(columns, record))
            # Önceden normalize edilmiş kodu kullan
            normalized_existing_code = record_dict['normalized_code']
            
            # Benzerlik oranını hesapla
            similarity = SequenceMatcher(
                None, 
                normalized_new_code, 
                normalized_existing_code
            ).ratio()
            
            # Benzerlik eşiğini geçiyorsa kaydı döndür
            if similarity >= similarity_threshold:
                return True, record_dict
        
        return False, None
        
    except Exception as e:
        print(f"Error checking similar execution: {e}")
        return False, None
    finally:
        if 'conn' in locals():
            conn.close()

def get_system_info():
    """Sistem bilgilerini toplar"""
    try:
        cpu_info = {
            'model': platform.processor(),
            'count': psutil.cpu_count(),
            'usage': psutil.cpu_percent(interval=1)
        }
        
        ram_info = {
            'total_gb': round(psutil.virtual_memory().total / (1024**3), 2),  # GB cinsinden
            'usage': psutil.virtual_memory().percent
        }
        
        os_info = {
            'name': platform.system(),
            'version': platform.version()
        }
        
        return cpu_info, ram_info, os_info
    except Exception as e:
        print(f"Error getting system info: {e}")
        return None, None, None

def save_execution_report(
    programming_language,
    execution_count,
    total_carbon_emission,
    execution_duration,
    codecarbon_data,
    code_text
):
    """Çalıştırma raporunu veritabanına kaydeder"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Sistem bilgilerini al
        cpu_info, ram_info, os_info = get_system_info()
        
        # CodeCarbon verilerini hazırla
        carbon_per_execution = total_carbon_emission / execution_count if execution_count > 0 else 0
        
        # Verileri kaydet
        try:
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
                country_name,
                country_iso_code,
                region,
                os_name,
                os_version,
                code_text,
                normalized_code
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                programming_language,
                execution_count,
                total_carbon_emission,
                carbon_per_execution,
                execution_duration,
                cpu_info['model'] if cpu_info else None,
                cpu_info['count'] if cpu_info else None,
                cpu_info['usage'] if cpu_info else None,
                ram_info['total_gb'] if ram_info else None,
                ram_info['usage'] if ram_info else None,
                getattr(codecarbon_data, 'country_name', None),
                getattr(codecarbon_data, 'country_iso_code', None),
                getattr(codecarbon_data, 'region', None),
                os_info['name'] if os_info else None,
                os_info['version'] if os_info else None,
                code_text,
                normalize_code(code_text)  # Normalize edilmiş kodu da kaydet
            ))
        except Exception as e:
            raise Exception(f"Error inserting record: {e}")
        
        conn.commit()
        return cursor.lastrowid
    except Exception as e:
        print(f"Error saving execution report: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

def get_execution_reports(limit=100):
    """Son execution raporlarını getirir"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
        SELECT * FROM execution_reports 
        ORDER BY execution_time DESC 
        LIMIT ?
        ''', (limit,))
        
        columns = [description[0] for description in cursor.description]
        reports = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return reports
    except Exception as e:
        print(f"Error getting execution reports: {e}")
        return []
    finally:
        if 'conn' in locals():
            conn.close()
