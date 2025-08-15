/**
 * HTTPculateHistory Bileşeni
 * =================================================================
 * HTTP isteklerinin emisyon hesaplama geçmişini görüntüleyen bileşen. 
 * Kullanıcıların daha önce yaptıkları HTTP isteklerinin emisyon sonuçlarını listeler.
 */

import { useState, useEffect } from "react";
import AnimatedItem from "../../AnimatedItem";
import "./HTTPculateHistory.scss";

function HTTPRequestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  // Backend'den geçmiş kayıtları çeker
  const fetchHistory = async () => {
    try {
      // Node.js backend'e istek gönder
      const response = await fetch("http://localhost:3000/httpculate/history");
      
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
    return <div className="error">Henüz hiç HTTP isteği yapılmamış.</div>;
  }

  return (
    <AnimatedItem className="httpculate-history">
      {/* Geçmiş kayıt kartı */}
      {history.map((record, index) => (
        <div key={index} className="record">
          {/* Metod ve Zaman Bilgileri */}
          <div className="record-row">
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
          {/* Metrikler */}
          <div className="record-metrics">
            {/* Karbon Emisyonu */}
            <div className="record-group">
              <p className="label">Carbon Emissions</p>
              <p className="value green">
                {record.estimatedCO2 ? record.estimatedCO2.toFixed(6) : "0"} g CO₂
              </p>
            </div>
            {/* Veri Boyutu */}
            <div className="record-group">
              <p className="label">Data Size</p>
              <p className="value green">
                {record.totalBytes ? (record.totalBytes / 1024).toFixed(2) : "0"} KB
              </p>
            </div>
            {/* Kullanılan Kütüphane */}
            <div className="record-group">
              <p className="label">Library</p>
              <p className="value">{record.library}</p>
            </div>
            {/* Yeşil Sunucu Durumu */}
            <div className="record-group">
              <p className="label">Green Server</p>
              <p className="value">
                {record.isGreen ? "✅ Yes" : "⚠️ No"}
              </p>
            </div>
          </div>
          {/* Sistem Bilgileri */}
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
          {/* İstek Bilgileri */}
          <div className="record-request">
            {/* URL Bilgisi */}
            <div className="record-group">
              <p className="label">URL</p>
              <p className="value system">{record.url}</p>
            </div>
            {/* Hata Bilgisi (varsa) */}
            {record.error && (
              <div className="record-group">
                <p className="label">Error</p>
                <p className="value system error">{record.error}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </AnimatedItem>
  );
}

export default HTTPRequestHistory;