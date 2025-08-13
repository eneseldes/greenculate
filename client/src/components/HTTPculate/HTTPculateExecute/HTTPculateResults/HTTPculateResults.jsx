import "./HTTPculateResults.scss";

function HTTPculateResults({ result }) {
  return (
    <>
      {result && (
        <div className="httpculate-results">
          <div className="title">HTTP İstek Sonuçları</div>
          <div className="grid">
            {/* Emisyon */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon green">
                  <span>🌱</span>
                </div>
                <div className="card-text">
                  <p className="label">Emisyon</p>
                  <p className="value">
                    {result.emissions
                      ? `${result.emissions.toFixed(6)} g CO₂`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Veri Transferi */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon blue">
                  <span>📦</span>
                </div>
                <div className="card-text">
                  <p className="label">Veri Transferi</p>
                  <p className="value">
                    {result.total_bytes
                      ? `${(result.total_bytes / 1024).toFixed(2)} KB`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Çalışma Süresi */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon purple">
                  <span>⏱️</span>
                </div>
                <div className="card-text">
                  <p className="label">Çalışma Süresi</p>
                  <p className="value">
                    {result.execution_time
                      ? `${(result.execution_time * 1000).toFixed(2)} ms`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Green Hosting */}
            <div className="card">
              <div className="card-content">
                <div className="card-icon yellow">
                  <span>🌍</span>
                </div>
                <div className="card-text">
                  <p className="label">Yeşil Hosting</p>
                  <p
                    className={`value ${
                      result.is_green_hosting ? "success" : "warning"
                    }`}
                  >
                    {result.is_green_hosting ? "✅ Evet" : "⚠️ Hayır"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sonuç Detayları */}
          <div className="details">
            <h4 className="title">Sonuç Detayları</h4>
            <div className="grid">
              <div className="details-item">
                <p className="label">Durum Kodu</p>
                <p
                  className={`value ${
                    result.status && result.status < 400 ? "success" : "error"
                  }`}
                >
                  {result.status || "N/A"}
                </p>
              </div>
              <div className="details-item">
                <p className="label">Kütüphane</p>
                <p className="value">{result.library || "N/A"}</p>
              </div>
              <div className="details-item">
                <p className="label">HTTP Metodu</p>
                <p className="value">{result.method || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default HTTPculateResults;
