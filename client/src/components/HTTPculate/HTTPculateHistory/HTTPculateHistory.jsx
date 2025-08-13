import { useState, useEffect } from "react";
import "./HTTPculateHistory.scss";

function HTTPRequestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:3000/request/history");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHistory(data);
      setError(null);
    } catch (error) {
      setError(error.message || "Geçmiş yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="error">Geçmiş yüklenirken bir hata oluştu.</div>;
  }

  return (
    <div className="httpculate-history">
      {history.map((record, index) => (
        <div key={index} className="record">
          <div className="record-row">
            {/* Method and Timestamp */}
            <div className="record-group">
              <p className="label">Method</p>
              <p className="value">{record.method}</p>
            </div>
            <div className="record-group">
              <p className="label">Request Time</p>
              <p className="value">
                {new Date(record.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="record-metrics">
            {/* Metrics */}
            <div className="record-group">
              <p className="label">Carbon Emissions</p>
              <p className="value green">
                {record.estimatedCO2 ? record.estimatedCO2.toFixed(6) : "0"} g CO₂
              </p>
            </div>
            <div className="record-group">
              <p className="label">Data Size</p>
              <p className="value green">
                {record.totalBytes ? (record.totalBytes / 1024).toFixed(2) : "0"} KB
              </p>
            </div>
            <div className="record-group">
              <p className="label">Library</p>
              <p className="value">{record.library}</p>
            </div>
            <div className="record-group">
              <p className="label">Green Server</p>
              <p className="value">
                {record.isGreen ? "✅ Yes" : "⚠️ No"}
              </p>
            </div>
          </div>

          {/* System Info */}
          <div className="record-system">
            <div className="record-group">
              <p className="label">CPU Model</p>
              <p className="value system">{record.cpu_model || "Unknown"}</p>
            </div>
            <div className="record-group">
              <p className="label">RAM</p>
              <p className="value system">
                {record.total_ram_gb ? record.total_ram_gb.toFixed(2) : "0"} GB
              </p>
            </div>
            <div className="record-group">
              <p className="label">Location</p>
              <p className="value system">
                {record.country_name || "Unknown"} ({record.country_iso_code || "N/A"})
              </p>
            </div>
          </div>

          {/* Request Info */}
          <div className="record-request">
            <div className="record-group">
              <p className="label">URL</p>
              <p className="value system">{record.url}</p>
            </div>
            {record.error && (
              <div className="record-group">
                <p className="label">Error</p>
                <p className="value system error">{record.error}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default HTTPRequestHistory;