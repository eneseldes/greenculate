import { useState, useEffect } from "react";
import AnimatedItem from "../../AnimatedItem";
import "./CodeculateHistory.scss";

function CodeExecutionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:5000/history");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setHistory(data);
      setError(null);
    } catch (error) {
      setError(err.message || "Geçmiş yüklenirken bir hata oluştu");
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
    return <div className="loading">Henüz hiçbir kod çalıştırılmadı.</div>;
  }

  return (
    <AnimatedItem className="codeculate-history">
      {history.map((record, index) => (
        <div key={index} className="record">
          <div className="record-header">
            <div className="header-left">
              <div className="icon-circle">📊</div>
              <div>
                <h3>Codeculate Raporu</h3>
                <p>{new Date(record.execution_time).toLocaleString()}</p>
              </div>
            </div>
            <div className="tags">
              <div className="tag-green">{record.execution_count}x tekrar</div>
              {Boolean(record.is_scaled) && record.scale_threshold != null && (
                <div className="tag-yellow">
                  {record.scale_threshold} tekrar üzerinden ölçeklendirildi
                </div>
              )}
            </div>
          </div>
          <div className="record-row">
            <div className="record-group">
              <p className="label">Language</p>
              <p className="value">{record.programming_language}</p>
            </div>
            <div className="record-group">
              <p className="label">Duration</p>
              <p className="value">
                {record.execution_duration_seconds
                  ? record.execution_duration_seconds.toFixed(2)
                  : "0"}
                s
              </p>
            </div>
          </div>
          <div className="record-row">
            <div className="record-group">
              <p className="label">Total Emissions</p>
              <p className="value green">
                {record.total_carbon_emission
                  ? record.total_carbon_emission.toExponential(4)
                  : "0"}{" "}
                (kg CO₂)
              </p>
            </div>
            <div className="record-group">
              <p className="label">Per Execution</p>
              <p className="value green">
                {record.carbon_per_execution
                  ? record.carbon_per_execution.toExponential(4)
                  : "0"}{" "}
                (kg CO₂)
              </p>
            </div>
          </div>
          {/* System Info */}
          <div className="record-system">
            <div className="record-group">
              <p className="label">CPU Model</p>
              <p className="value system">{record.cpu_model}</p>
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
                {record.country_name || "Unknown"} (
                {record.country_iso_code || "N/A"})
              </p>
            </div>
          </div>

          {/* Code Preview */}
          <div className="record-code">
            <p className="label">Code Preview</p>
            <pre>{record.code_text}</pre>
          </div>
        </div>
      ))}
    </AnimatedItem>
  );
}

export default CodeExecutionHistory;
