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
from config.logging_config import setup_logger

logger = setup_logger('json_parser')

################========== JSONParser ==========################
class JSONParser:
    def __init__(self):
        self.parsers = {
            'json': self._parse_with_json,
            'orjson': self._parse_with_orjson,
            'ujson': self._parse_with_ujson
        }
        logger.info("JSONParser initialized with standard, orjson, and ujson parsers")

    def parse_json(self, json_str: str, repeat: int, scale_threshold: int = 10000, db_manager=None) -> Dict[str, Any]:
        try:
            logger.info(f"Starting JSON parsing with {repeat} repetitions (threshold: {scale_threshold})")
            logger.debug(f"Input JSON size: {len(json_str)} bytes")

            # Database'de benzer JSON var ise benzer JSON'un sonuçlarını döndür
            existing_report = db_manager.get_existing_report(json_str, repeat, scale_threshold)
            if existing_report:
                logger.info("Found cached results, returning from database")
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
            
            if repeat > scale_threshold:
                logger.info(f"Scaling enabled: actual_repeat={actual_repeat}, scale_factor={scale_factor}")
            
            # Tüm parser'lar için ölçüm yap
            logger.info("Starting measurements for all parsers")
            results = {
                "repeat": repeat,
                "json": self._parse_with_json(json_str, actual_repeat),
                "orjson": self._parse_with_orjson(json_str, actual_repeat),
                "ujson": self._parse_with_ujson(json_str, actual_repeat)
            }
            
            # Ölçeklendirme eşiğinden büyük tekrarlar için sonuçları ölçekle
            if repeat > scale_threshold:
                logger.info("Applying scaling to results")
                for parser in ["json", "orjson", "ujson"]:
                    results[parser]["emissions"] *= scale_factor
                    results[parser]["duration"] *= scale_factor
                results["scaled"] = True
                results["scale_threshold"] = scale_threshold
            
            # Sonuçları kaydet
            if db_manager:
                logger.info("Saving results to database")
                db_manager.save_report(results, json_str, scale_threshold)
            
            logger.info("JSON parsing completed successfully")
            return results

        except Exception as e:
            logger.error(f"Error in parse_json: {str(e)}")
            raise

    ################ json ile parse işlemi yapar ################
    def _parse_with_json(self, json_str: str, repeat: int) -> Dict[str, Any]:
        logger.info(f"Starting standard json parser measurement ({repeat} repetitions)")
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        try:
            # Codecarbon'u başlat
            tracker.start()
            
            # JSON işlemleri
            data = json.loads(json_str)
            for _ in range(repeat):
                serialized = json.dumps(data)
                json.loads(serialized)
                # CPU kullanımını artırmak için
                for i in range(1000):
                    _ = str(data)

            emissions = tracker.stop()
            duration = time.time() - start_time
            
            logger.info(f"Standard json parser completed: {duration:.2f}s, {emissions:.6f}g CO2")
            return {
                "parser": "json",
                "duration": duration,
                "emissions": emissions or 0,
                "repeat": repeat
            }
        except Exception as e:
            logger.error(f"Error in standard json parser: {str(e)}")
            raise
        finally:
            try:
                tracker.stop()
            except:
                pass

    ################ orjson ile parse işlemi yapar ################
    def _parse_with_orjson(self, json_str: str, repeat: int) -> Dict[str, Any]:
        logger.info(f"Starting orjson parser measurement ({repeat} repetitions)")
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        try:
            # Emisyon ölçümünü başlat
            tracker.start()
            
            # JSON işlemleri
            data = orjson.loads(json_str.encode())
            for _ in range(repeat):
                serialized = orjson.dumps(data)
                orjson.loads(serialized)
                # CPU kullanımını artırmak için
                for i in range(1000):
                    _ = str(data)

            emissions = tracker.stop()
            duration = time.time() - start_time
            
            logger.info(f"Orjson parser completed: {duration:.2f}s, {emissions:.6f}g CO2")
            return {
                "parser": "orjson",
                "duration": duration,
                "emissions": emissions or 0,
                "repeat": repeat
            }
        except Exception as e:
            logger.error(f"Error in orjson parser: {str(e)}")
            raise
        finally:
            try:
                tracker.stop()
            except:
                pass

    ################ ujson ile parse işlemi yapar ################
    def _parse_with_ujson(self, json_str: str, repeat: int) -> Dict[str, Any]:
        logger.info(f"Starting ujson parser measurement ({repeat} repetitions)")
        tracker = EmissionsTracker(project_name="json_parsing", tracking_mode="process")
        start_time = time.time()
        
        try:
            # Emisyon ölçümünü başlat
            tracker.start()
            
            # JSON işlemleri
            data = ujson.loads(json_str)
            for _ in range(repeat):
                serialized = ujson.dumps(data)
                ujson.loads(serialized)
                # CPU kullanımını artırmak için
                for i in range(1000):
                    _ = str(data)

            emissions = tracker.stop()
            duration = time.time() - start_time
            
            logger.info(f"Ujson parser completed: {duration:.2f}s, {emissions:.6f}g CO2")
            return {
                "parser": "ujson",
                "duration": duration,
                "emissions": emissions or 0,
                "repeat": repeat
            }
        except Exception as e:
            logger.error(f"Error in ujson parser: {str(e)}")
            raise
        finally:
            try:
                tracker.stop()
            except:
                pass