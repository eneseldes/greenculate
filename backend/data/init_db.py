import sqlite3
import os

# Veritabanı dosyasının yolu
DB_PATH = os.path.join(os.path.dirname(__file__), 'code-execution-reports.db')

def init_db():
    # Veritabanı bağlantısı oluştur
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Execution raporları tablosunu oluştur
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
        country_name TEXT,
        country_iso_code TEXT,
        region TEXT,
        os_name TEXT,
        os_version TEXT,
        code_text TEXT NOT NULL,
        normalized_code TEXT NOT NULL
    )
    ''')

    # Değişiklikleri kaydet ve bağlantıyı kapat
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print(f"Database initialized at {DB_PATH}")
