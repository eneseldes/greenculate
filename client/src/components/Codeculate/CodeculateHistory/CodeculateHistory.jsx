/**
 * CodeculateHistory Bileşeni
 * =================================================================
 * Kod emisyonu hesaplama geçmişini görüntüleyen bileşen. Kullanıcıların
 * daha önce çalıştırdıkları kodların emisyon sonuçlarını listeler.
 */

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

  // Backend'den geçmiş kayıtları çeker
  const fetchHistory = async () => {
    try {
      // Backend'e istek gönder
      const response = await fetch("http://localhost:5000/codeculate/history");
      
      // HTTP hata kontrolü
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Başarılı yanıtı al ve state'e kaydet
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
    return <div className="loading"></div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="loading">Henüz hiçbir kod çalıştırılmadı.</div>;
  }

  return (
    <AnimatedItem className="codeculate-history">
      {/* Geçmiş kayıt kartı */}
      {history.map((record, index) => (
        <div key={index} className="record">
          {/* Kayıt başlığı */}
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
          {/* Dil ve Süre Bilgileri */}
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
          {/* Emisyon Bilgileri */}
          <div className="record-row">
            <div className="record-group">
              <p className="label">Total Emissions</p>
              <p className="value green">
                {record.total_carbon_emission
                  ? record.total_carbon_emission.toFixed(6)
                  : "0"}{" "}
                (kg CO₂)
              </p>
            </div>
            <div className="record-group">
              <p className="label">Per Execution</p>
              <p className="value green">
                {record.carbon_per_execution
                  ? record.carbon_per_execution.toFixed(6)
                  : "0"}{" "}
                (kg CO₂)
              </p>
            </div>
          </div>
          {/* Sistem Bilgileri */}
          <div className="record-system">
            <div className="record-group">
              <p className="label">CPU Model</p>
              <p className="value system">{record.cpu_model}</p>
            </div>
            <div className="record-group">
              <p className="label">CPU Sayısı</p>
              <p className="value system">{record.cpu_count} çekirdek</p>
            </div>
            <div className="record-group">
              <p className="label">RAM</p>
              <p className="value system">
                {record.total_ram_gb ? record.total_ram_gb.toFixed(2) : "0"} GB
              </p>
            </div>
            <div className="record-group">
              <p className="label">İşletim Sistemi</p>
              <p className="value system">{record.os_name}</p>
            </div>
          </div>
          {/* Kod Önizleme */}
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