import { useState, useEffect } from "react";
import AnimatedItem from "../../AnimatedItem";
import "./JSONculateHistory.scss";

function JSONParsingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/jsonculate/history");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err.message || "Geçmiş yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">Geçmiş yüklenirken bir hata oluştu.</div>;
  }

  if (history.length === 0) {
    return <div className="empty">Henüz hiç JSON parse işlemi yapılmamış.</div>;
  }

  return (
    <AnimatedItem className="jsonculate-history">
      {history.map((record) => (
        <div className="record" key={record.id}>
          {/* Header */}
          <div className="record-header">
            <div className="header-left">
              <div className="icon-circle">📊</div>
              <div>
                <h3>JSON Parse Raporu</h3>
                <p>{new Date(record.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="tags">
              <div className="tag-green">{record.iterations}x tekrar</div>
              {Boolean(record.is_scaled) && record.scale_threshold != null && (
                <div className="tag-yellow">
                  {record.scale_threshold} tekrar üzerinden ölçeklendirildi
                </div>
              )}
            </div>
          </div>

          {/* Results Grid */}
          <div className="results-grid">
            <div className="result-box">
              <div className="result-header">
                <span>📝</span>
                <p>json</p>
              </div>
              <div className="result-data">
                <div>
                  <p className="label">Emisyon</p>
                  <p className="value">
                    {record.json_emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="label">Süre</p>
                  <p className="value">{record.json_duration.toFixed(2)} sn</p>
                </div>
              </div>
            </div>

            <div className="result-box">
              <div className="result-header">
                <span>⚡</span>
                <p>orjson</p>
              </div>
              <div className="result-data">
                <div>
                  <p className="label">Emisyon</p>
                  <p className="value">
                    {record.orjson_emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="label">Süre</p>
                  <p className="value">
                    {record.orjson_duration.toFixed(2)} sn
                  </p>
                </div>
              </div>
            </div>

            <div className="result-box">
              <div className="result-header">
                <span>🚀</span>
                <p>ujson</p>
              </div>
              <div className="result-data">
                <div>
                  <p className="label">Emisyon</p>
                  <p className="value">
                    {record.ujson_emissions.toFixed(6)} kg CO₂
                  </p>
                </div>
                <div>
                  <p className="label">Süre</p>
                  <p className="value">{record.ujson_duration.toFixed(2)} sn</p>
                </div>
              </div>
            </div>

            <div className="result-box">
              <p className="label">JSON Boyutu</p>
              <p className="size">{(record.json_size / 1024).toFixed(2)} KB</p>
            </div>
          </div>

          {/* System Info */}
          <div className="system-info">
            <div className="system-info-title">Sistem Bilgileri</div>
            <div className="system-grid">
              <div>
                <p className="label">İşlemci</p>
                <p className="sys-value">{record.cpu_model}</p>
              </div>
              <div>
                <p className="label">CPU Sayısı</p>
                <p className="sys-value">{record.cpu_count} çekirdek</p>
              </div>
              <div>
                <p className="label">RAM</p>
                <p className="sys-value">{record.total_memory} GB</p>
              </div>
              <div>
                <p className="label">İşletim Sistemi</p>
                <p className="sys-value">{record.os_info}</p>
              </div>
            </div>
          </div>

          {/* JSON Preview */}
          <div className="json-preview">
            <p className="label">JSON İçeriği</p>
            <pre>{record.json_input}</pre>
          </div>
        </div>
      ))}
    </AnimatedItem>
  );
}

export default JSONParsingHistory;
