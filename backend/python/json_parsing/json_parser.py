import json
import orjson
import ujson
import time
from codecarbon import EmissionsTracker
from typing import Dict, Any, Union

class JSONParser:
    def __init__(self):
        self.parsers = {
            'json': self._parse_with_json,
            'orjson': self._parse_with_orjson,
            'ujson': self._parse_with_ujson
        }

    def _parse_with_json(self, json_str: str, iterations: int) -> Dict[str, Any]:
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        # Emisyon ölçümünü başlat
        tracker.start()
        
        try:
            # JSON işlemleri
            data = json.loads(json_str)
            for _ in range(iterations):
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
            "iterations": iterations
        }

    def _parse_with_orjson(self, json_str: str, iterations: int) -> Dict[str, Any]:
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        # Emisyon ölçümünü başlat
        tracker.start()
        
        try:
            # JSON işlemleri
            data = orjson.loads(json_str.encode())
            for _ in range(iterations):
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
            "iterations": iterations
        }

    def _parse_with_ujson(self, json_str: str, iterations: int) -> Dict[str, Any]:
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        # Emisyon ölçümünü başlat
        tracker.start()
        
        try:
            # JSON işlemleri
            data = ujson.loads(json_str)
            for _ in range(iterations):
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
            "iterations": iterations
        }

    def parse_json(self, json_str: str, iterations: int, db_manager=None) -> Dict[str, Any]:
        # Eğer db_manager varsa, önceki sonuçları kontrol et
        if db_manager:
            existing_report = db_manager.get_existing_report(json_str, iterations)
            if existing_report:
                return {
                    "iterations": existing_report["iterations"],
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
                    "system_info": {
                        "cpu_model": existing_report["cpu_model"],
                        "cpu_count": existing_report["cpu_count"],
                        "total_memory": existing_report["total_memory"],
                        "os_info": existing_report["os_info"]
                    }
                }
        
        # 1000'den büyük tekrarlar için optimizasyon
        actual_iterations = min(1000, iterations)
        scale_factor = iterations / actual_iterations if iterations > 1000 else 1
        
        # Tüm parser'lar için ölçüm yap
        results = {
            "iterations": iterations,
            "json": self._parse_with_json(json_str, actual_iterations),
            "orjson": self._parse_with_orjson(json_str, actual_iterations),
            "ujson": self._parse_with_ujson(json_str, actual_iterations)
        }
        
        # 1000'den büyük tekrarlar için sonuçları ölçekle
        if iterations > 1000:
            for parser in ["json", "orjson", "ujson"]:
                results[parser]["emissions"] *= scale_factor
                results[parser]["duration"] *= scale_factor
            results["scaled"] = True
        
        # Sonuçları kaydet
        if db_manager:
            db_manager.save_report(results, json_str)
        
        return results
