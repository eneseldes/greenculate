import React, { useEffect, useState } from 'react';
import { FaCar, FaHamburger, FaLightbulb, FaShower, FaTree, FaPlane } from 'react-icons/fa';
import axios from 'axios';
import './TotalEmissionsPage.scss';

const TotalEmissionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emissions, setEmissions] = useState({
    total: 0,
    code: 0,
    json: 0,
    http: 0
  });

  useEffect(() => {
    const fetchEmissions = async () => {
      try {
        // Python backend'den code ve json emisyonlarını al
        const pythonResponse = await axios.get('http://localhost:5000/total-emission');
        
        // Node backend'den http emisyonlarını al
        const nodeResponse = await axios.get('http://localhost:3000/total-emission');

        const totalEmissions = (
          pythonResponse.data.code_emissions +
          pythonResponse.data.json_emissions +
          nodeResponse.data.http_emissions
        );

        setEmissions({
          total: totalEmissions,
          code: pythonResponse.data.code_emissions,
          json: pythonResponse.data.json_emissions,
          http: nodeResponse.data.http_emissions
        });

        setLoading(false);
      } catch (err) {
        setError('Emisyon verileri alınırken bir hata oluştu.');
        setLoading(false);
        console.error('Error fetching emissions:', err);
      }
    };

    fetchEmissions();
  }, []);

  const equivalents = [
    {
      activity: "Araba Kullanımı",
      value: emissions.total / 0.2, // 1 km araba kullanımı yaklaşık 0.2 kg CO2
      unit: "km",
      icon: <FaCar />,
      description: "araba kullanımına eşdeğer"
    },
    {
      activity: "Hamburger Tüketimi",
      value: emissions.total / 3.5, // 1 hamburger yaklaşık 3.5 kg CO2
      unit: "adet",
      icon: <FaHamburger />,
      description: "hamburgere eşdeğer"
    },
    {
      activity: "Ampul Kullanımı",
      value: emissions.total / 0.1, // 1 saat 60W ampul yaklaşık 0.1 kg CO2
      unit: "saat",
      icon: <FaLightbulb />,
      description: "60W ampul kullanımına eşdeğer"
    },
    {
      activity: "Sıcak Duş",
      value: emissions.total / 25, // 10 dakikalık duş yaklaşık 2.5 kg CO2
      unit: "dakika",
      icon: <FaShower />,
      description: "sıcak duş süresine eşdeğer"
    },
    {
      activity: "Uçak Yolculuğu",
      value: emissions.total / 0.18, // 1 km uçak yolculuğu yaklaşık 0.18 kg CO2
      unit: "km",
      icon: <FaPlane />,
      description: "uçak yolculuğuna eşdeğer"
    }
  ];

  const formatValue = (value) => {
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'k';
    }
    return value.toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading">Veriler Yükleniyor...</div>
    );
  }

  if (error) {
    return (
      <div className="emission-equivalents error">
        <h2>Hata</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="total-emissions-container">
      <h2>Toplam Karbon Ayak İzi</h2>
      <div className="emissions-summary">
        <div className="total-emissions">
          <h3>Toplam Emisyon</h3>
          <p>{emissions.total.toFixed(2)} kg CO₂</p>
        </div>
        <div className="emissions-breakdown">
          <div className="breakdown-item">
            <span>Kod Emisyonu:</span>
            <span>{emissions.code.toFixed(6)} kg CO₂</span>
          </div>
          <div className="breakdown-item">
            <span>JSON Emisyonu:</span>
            <span>{emissions.json.toFixed(6)} kg CO₂</span>
          </div>
          <div className="breakdown-item">
            <span>HTTP Emisyonu:</span>
            <span>{emissions.http.toFixed(6)} kg CO₂</span>
          </div>
        </div>
      </div>
      <h3 className="equivalents-title">Günlük Hayattan Eşdeğerleri</h3>
      <div className="equivalents-grid">
        {equivalents.map((eq, index) => (
          <div key={index} className="equivalent-card">
            <div className="icon">{eq.icon}</div>
            <div className="content">
              <h3>{eq.activity}</h3>
              <p className="value">
                <span>{formatValue(eq.value)}</span> {eq.unit}
              </p>
              <p className="description">{eq.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="info-note">
        <FaTree className="tree-icon" />
        <p>
          Bu değerler yaklaşık hesaplamalardır ve gerçek koşullara göre değişiklik gösterebilir.
        </p>
      </div>
    </div>
  );
};

export default TotalEmissionsPage;