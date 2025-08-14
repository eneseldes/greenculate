/**
 * CodeculateResults Bileşeni
 * =================================================================
 * Kod emisyonu hesaplama sonuçlarını görüntüleyen bileşen. Backend'den
 * gelen emisyon verilerini kartlar halinde gösterir.
 */

import { memo } from "react";
import useFocusAfterRender from "../../../../hooks/useFocusAfterRender";
import "./CodeculateResults.scss";

/**
 * CodeEditor her değişimde render'a sebep olmasın diye memo kullanıyoruz
 * @param {Object} result - Backend'den gelen hesaplama sonuçları
 */
const CodeculateResults = memo(function CodeculateResults({ result }) {
  // Sonuç geldiğinde result container'a focus alma hook'u
  const containerRef = useFocusAfterRender(result);
  return (
    <>
      {result && (
        <div
          ref={containerRef}
          className="codeculate-results"
          tabIndex={-1} // focus alabilmesi için
        >
          <div className="title">Hesaplama Sonuçları</div>
          <div className="grid">
            {/* Toplam Emisyon Kartı */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon green">
                  <span>🌱</span>
                </div>
                <div className="card-text">
                  <p className="label">Toplam Emisyon</p>
                  <p className="value">
                    {result.total_emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
              </div>
            </div>
            {/* Ortalama Emisyon Kartı */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon blue">
                  <span>📊</span>
                </div>
                <div className="card-text">
                  <p className="label">Ortalama Emisyon</p>
                  <p className="value">
                    {result.avg_emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
              </div>
            </div>
            {/* Çalışma Süresi Kartı */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon purple">
                  <span>⏱️</span>
                </div>
                <div className="card-text">
                  <p className="label">Toplam Süre</p>
                  <p className="value">
                    {result.total_execution_time.toFixed(2)} saniye
                  </p>
                </div>
              </div>
            </div>
            {/* Başarı Oranı Kartı */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon green">
                  <span>✅</span>
                </div>
                <div className="card-text">
                  <p className="label">Başarı Oranı</p>
                  <p className="value">
                    {result.successful_runs}/{result.repeat} (
                    {((result.successful_runs / result.repeat) * 100).toFixed(1)}
                    %)
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Son Çalıştırma Detayları */}
          {result.last_result && (
            <div className="details">
              <h4 className="title">Son Çalıştırma Detayları</h4>
              <div className="grid">
                {/* Durum Bilgisi */}
                <div className="details-item">
                  <p className="label">Durum</p>
                  <p
                    className={`value ${
                      result.last_result.success ? "success" : "error"
                    }`}
                  >
                    {result.last_result.success ? "Başarılı" : "Başarısız"}
                  </p>
                </div>
                {/* Çalışma Süresi */}
                <div className="details-item">
                  <p className="label">Çalışma Süresi</p>
                  <p className="value">
                    {result.last_result.execution_time.toFixed(2)} saniye
                  </p>
                </div>
                {/* Emisyon Bilgisi */}
                <div className="details-item">
                  <p className="label">Emisyon</p>
                  <p className="value">
                    {result.last_result.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
              </div>
              {/* Kod Çıktısı (varsa) */}
              {result.last_result.stdout && (
                <div className="output">
                  <p className="label">Çıktı:</p>
                  <pre>{result.last_result.stdout}</pre>
                </div>
              )}
              {/* Hata Mesajı (varsa) */}
              {result.last_result.stderr && (
                <div className="error">
                  <p className="label">Hata:</p>
                  <pre>{result.last_result.stderr}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
});

export default CodeculateResults;
