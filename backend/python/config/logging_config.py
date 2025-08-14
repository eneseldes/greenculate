# logging_config.py
import logging
import sys
import os
import codecs
from logging.handlers import RotatingFileHandler

def setup_logger(name: str):
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)  # Tüm seviyeler aktif

    # Logs dizinini oluştur
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'logs')
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)

    # Log formatı
    formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s] '
        '%(message)s (%(filename)s:%(lineno)d)'
    )

    # Konsol çıkışı
    console_handler = logging.StreamHandler(codecs.getwriter('utf-8')(sys.stdout.buffer))
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)

    # Dosya çıkışı (rotating)
    log_file = os.path.join(logs_dir, 'app.log')
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=5*1024*1024,  # 5MB
        backupCount=5,
        encoding='utf-8'  # UTF-8 encoding ekledik
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)

    # Handler'ları ekle
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)

    return logger