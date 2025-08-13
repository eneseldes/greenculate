import "./CodeculateResults.scss";

function CodeculateResults({ result }) {
  return (
    <>
      {result && (
        <div className="codeculate-results">
          <div className="title">Hesaplama Sonuçları</div>
          <div className="grid">
            {/* Total Emissions */}
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

            {/* Average Emissions */}
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

            {/* Execution Time */}
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

            {/* Success Rate */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon green">
                  <span>✅</span>
                </div>
                <div className="card-text">
                  <p className="label">Başarı Oranı</p>
                  <p className="value">
                    {result.successful_runs}/{result.repeat} (
                    {((result.successful_runs / result.repeat) * 100).toFixed(
                      1
                    )}
                    %)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Result Details */}
          {result.last_result && (
            <div className="details">
              <h4 className="title">Son Çalıştırma Detayları</h4>
              <div className="grid">
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
                <div className="details-item">
                  <p className="label">Çalışma Süresi</p>
                  <p className="value">
                    {result.last_result.execution_time.toFixed(2)} saniye
                  </p>
                </div>
                <div className="details-item">
                  <p className="label">Emisyon</p>
                  <p className="value">
                    {result.last_result.emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
              </div>

              {/* Output */}
              {result.last_result.stdout && (
                <div className="output">
                  <p className="label">Çıktı:</p>
                  <pre>{result.last_result.stdout}</pre>
                </div>
              )}

              {/* Error */}
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
}

export default CodeculateResults;
