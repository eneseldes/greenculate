/**
 * JSONculateResults Bileşeni
 * =================================================================
 * JSON emisyonu hesaplama sonuçlarını görüntüleyen bileşen. Üç farklı
 * JSON parser'ının (json, orjson, ujson) performans karşılaştırmasını gösterir.
 */

import useFocusAfterRender from "../../../../hooks/useFocusAfterRender";
import "./JSONculateResults.scss";

/**
 * JSONculateResults Bileşeni
 * JSON emisyonu hesaplama sonuçlarını görüntüler
 * @param {Object} result - Backend'den gelen JSON parse sonuçları
 */
function JSONculateResults({ result }) {
  // Sonuç geldiğinde result container'a focus alma hook'u
  const containerRef = useFocusAfterRender(result);

  return (
    <>
      {result && (
        <div
          ref={containerRef}
          className="jsonculate-results"
          tabIndex={-1} // focus alabilmesi için
        >
          <div className="header">
            <h3 className="title">Parse Sonuçları</h3>
            {/* Ölçeklendirme Bilgisi (varsa) */}
            {result.scaled && (
              <div className="pill pill--amber">
                {result.scale_threshold} tekrar üzerinden ölçeklendirildi
              </div>
            )}
            {/* Önbellek Bilgisi (varsa) */}
            {result.from_cache && (
              <div className="pill pill--blue">Önbellekten alındı</div>
            )}
          </div>
          {/* Parser Sonuçları */}
          <div className="parsers">
            {/* JSON Parser Sonucu */}
            <div className="parser-card">
              <div className="parser-head">
                <div className="avatar avatar--green">
                  <span className="emoji">📝</span>
                </div>
                <div>
                  <p className="parser-name">json</p>
                  <p className="parser-caption">Standart JSON Parser</p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <p className="muted">Emisyon</p>
                  <p className="value">
                    {result.json.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="muted">Süre</p>
                  <p className="value">
                    {result.json.duration.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>
            {/* orjson Parser Sonucu */}
            <div className="parser-card">
              <div className="parser-head">
                <div className="avatar avatar--blue">
                  <span className="emoji">⚡</span>
                </div>
                <div>
                  <p className="parser-name">orjson</p>
                  <p className="parser-caption">Rust-tabanlı Hızlı Parser</p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <p className="muted">Emisyon</p>
                  <p className="value">
                    {result.orjson.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="muted">Süre</p>
                  <p className="value">
                    {result.orjson.duration.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>
            {/* ujson Parser Sonucu */}
            <div className="parser-card">
              <div className="parser-head">
                <div className="avatar avatar--purple">
                  <span className="emoji">🚀</span>
                </div>
                <div>
                  <p className="parser-name">ujson</p>
                  <p className="parser-caption">Ultra Hızlı JSON Parser</p>
                </div>
              </div>
              <div className="stats">
                <div>
                  <p className="muted">Emisyon</p>
                  <p className="value">
                    {result.ujson.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="muted">Süre</p>
                  <p className="value">
                    {result.ujson.duration.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default JSONculateResults;
