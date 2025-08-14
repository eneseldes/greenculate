"""
    JSONParser
    =================================================================
    Verilen JSON dosyasını json, orjson, ujson kütüphaneleri ile parse edip bu
    kütüphanelerin codecarbon ile karbon salınımını ölçen jsonculate için ana 
    yürütme sınıfıdır. Frontend'e gönderilecek karbon emisyon sonuçları burada 
    ölçülür.

    Özellikler:
    - JSON Parse eder.
    - Kodun karbon salınımını ölçer.
    - Sonucu döndürür (frontend'e).
"""

import json
import orjson
import ujson
import time
from codecarbon import EmissionsTracker
from typing import Dict, Any, Union

################========== JSONParser ==========################
class JSONParser:
    def __init__(self):
        self.parsers = {
            'json': self._parse_with_json,
            'orjson': self._parse_with_orjson,
            'ujson': self._parse_with_ujson
        }

    def parse_json(self, json_str: str, repeat: int, scale_threshold: int = 10000, db_manager=None) -> Dict[str, Any]:
        # Database'de benzer JSON var ise benzer JSON'un sonuçlarını döndür
        existing_report = db_manager.get_existing_report(json_str, repeat, scale_threshold)
        if existing_report:
            return {
                "repeat": existing_report["repeat"],
                "json": {
                    "emissions": existing_report["json_emissions"],
                    "duration": existing_report["json_duration"]
                },
                "orjson": {
                    "emissions": existing_report["orjson_emissions"],
                    "duration": existing_report["orjson_duration"]
                },
                "ujson": {
                    "emissions": existing_report["ujson_emissions"],
                    "duration": existing_report["ujson_duration"]
                },
                "from_cache": True,
                "scaled": existing_report["is_scaled"],
                "scale_threshold": existing_report["scale_threshold"],
                "system_info": {
                    "cpu_model": existing_report["cpu_model"],
                    "cpu_count": existing_report["cpu_count"],
                    "total_memory": existing_report["total_memory"],
                    "os_info": existing_report["os_info"]
                }
            }
        
        # Ölçeklendirme eşiğinden büyük tekrarlar için ayar
        actual_repeat = min(scale_threshold, repeat)
        scale_factor = repeat / actual_repeat if repeat > scale_threshold else 1
        
        # Tüm parser'lar için ölçüm yap
        results = {
            "repeat": repeat,
            "json": self._parse_with_json(json_str, actual_repeat),
            "orjson": self._parse_with_orjson(json_str, actual_repeat),
            "ujson": self._parse_with_ujson(json_str, actual_repeat)
        }
        
        # Ölçeklendirme eşiğinden büyük tekrarlar için sonuçları ölçekle
        if repeat > scale_threshold:
            for parser in ["json", "orjson", "ujson"]:
                results[parser]["emissions"] *= scale_factor
                results[parser]["duration"] *= scale_factor
            results["scaled"] = True
            results["scale_threshold"] = scale_threshold
        
        # Sonuçları kaydet
        if db_manager:
            db_manager.save_report(results, json_str, scale_threshold)
        
        # Sonuçları döndür (frontend'e gönderilecek)
        return results

    ################ json ile parse işlemi yapar ################
    def _parse_with_json(self, json_str: str, repeat: int) -> Dict[str, Any]:
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        # Codecarbon'u başlat
        tracker.start()
        
        try:
            # JSON işlemleri
            data = json.loads(json_str)
            for _ in range(repeat):
                serialized = json.dumps(data)
                json.loads(serialized)
                # CPU kullanımını artırmak için
                for i in range(1000):
                    _ = str(data)
        finally:
            # Emisyon ölçümünü bitir
            emissions = tracker.stop()
            duration = time.time() - start_time

        return {
            "parser": "json",
            "duration": duration,
            "emissions": emissions or 0,
            "repeat": repeat
        }

    ################ orjson ile parse işlemi yapar ################
    def _parse_with_orjson(self, json_str: str, repeat: int) -> Dict[str, Any]:
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        # Emisyon ölçümünü başlat
        tracker.start()
        
        try:
            # JSON işlemleri
            data = orjson.loads(json_str.encode())
            for _ in range(repeat):
                serialized = orjson.dumps(data)
                orjson.loads(serialized)
                # CPU kullanımını artırmak için
                for i in range(1000):
                    _ = str(data)
        finally:
            # Emisyon ölçümünü bitir
            emissions = tracker.stop()
            duration = time.time() - start_time

        return {
            "parser": "orjson",
            "duration": duration,
            "emissions": emissions or 0,
            "repeat": repeat
        }

    ################ ujson ile parse işlemi yapar ################
    def _parse_with_ujson(self, json_str: str, repeat: int) -> Dict[str, Any]:
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        # Emisyon ölçümünü başlat
        tracker.start()
        
        try:
            # JSON işlemleri
            data = ujson.loads(json_str)
            for _ in range(repeat):
                serialized = ujson.dumps(data)
                ujson.loads(serialized)
                # CPU kullanımını artırmak için
                for i in range(1000):
                    _ = str(data)
        finally:
            # Emisyon ölçümünü bitir
            emissions = tracker.stop()
            duration = time.time() - start_time

        return {
            "parser": "ujson",
            "duration": duration,
            "emissions": emissions or 0,
            "repeat": repeat
        }