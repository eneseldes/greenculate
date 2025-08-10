// /client/src/App.jsx
import { useState } from "react";
import CodeCarbonTracker from "./CodeCarbonTracker";

function App() {
  const [activeTab, setActiveTab] = useState("http"); // "http" or "code"
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    url: "https://jsonplaceholder.typicode.com/comments",
    method: "GET",
    repeat: 10,
    payload: JSON.stringify({
      name: "irem",
      email: "irem@example.com",
      age: 22,
      location: "Antalya",
      message: "karbon testi"
    }, null, 2)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "repeat" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    try {
      const payload =
        formData.method === "POST" && formData.payload
          ? JSON.parse(formData.payload)
          : null;

      console.log("Backend'e istek gönderiliyor...", {
        url: formData.url,
        method: formData.method,
        repeat: formData.repeat,
        payload
      });

      const response = await fetch("http://localhost:3000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.url,
          method: formData.method,
          repeat: formData.repeat,
          payload
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend'den gelen veri:", data);
      setResult(data);
    } catch (error) {
      console.error("Hata:", error);
      alert(`CO2 hesaplama hatası: ${error.message}\n\nBackend server'ın çalıştığından emin olun:\ncd /Users/iremdenizunal/carbon-tracker\nnode server.js`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)',
      color: '#1f2937',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '1024px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#166534',
            marginBottom: '8px'
          }}>
            Carbon Tracker
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#16a34a',
            fontWeight: '500'
          }}>
            Karbon emisyonunu hesapla
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          padding: '8px',
          border: '1px solid #dcfce7'
        }}>
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => setActiveTab("http")}
              style={{
                flex: 1,
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === "http" 
                  ? 'linear-gradient(135deg, #22c55e 0%, #059669 100%)'
                  : '#f3f4f6',
                color: activeTab === "http" ? 'white' : '#374151'
              }}
            >
              🌐 HTTP Tracker
            </button>
            <button
              onClick={() => setActiveTab("code")}
              style={{
                flex: 1,
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: activeTab === "code" 
                  ? 'linear-gradient(135deg, #22c55e 0%, #059669 100%)'
                  : '#f3f4f6',
                color: activeTab === "code" ? 'white' : '#374151'
              }}
            >
              💻 CodeCarbon Tracker
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "http" ? (
          // HTTP Tracker Content
          <>
            {/* Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '32px',
              border: '1px solid #dcfce7'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* URL Input */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    URL
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '16px',
                      color: '#374151',
                      transition: 'all 0.2s'
                    }}
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>

                {/* Method and Repeat Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Method
                    </label>
                    <select
                      name="method"
                      value={formData.method}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#374151',
                        backgroundColor: 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Repeat
                    </label>
                    <input
                      type="number"
                      name="repeat"
                      value={formData.repeat}
                      min={1}
                      max={100}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        color: '#374151',
                        transition: 'all 0.2s'
                      }}
                    />
                  </div>
                </div>

                {/* Payload */}
                {formData.method === "POST" && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '8px'
                    }}>
                      Payload (JSON)
                    </label>
                    <textarea
                      name="payload"
                      value={formData.payload}
                      onChange={handleChange}
                      rows={8}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '14px',
                        color: '#374151',
                        fontFamily: 'monospace',
                        transition: 'all 0.2s'
                      }}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div style={{ paddingTop: '16px' }}>
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      fontSize: '18px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #16a34a 0%, #047857 100%)';
                      e.target.style.transform = 'scale(1.02)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'linear-gradient(135deg, #22c55e 0%, #059669 100%)';
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    CO2 Hesapla
                  </button>
                </div>
              </form>
            </div>

            {/* Results */}
            {result && (
              <div style={{
                background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                borderRadius: '16px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                padding: '32px',
                border: '1px solid #bbf7d0'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#166534',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Hesaplama Sonuçları
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '24px'
                }}>
                  {/* Request Count */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dcfce7'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#dbeafe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: '#2563eb', fontSize: '20px' }}>🔄</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>İstek sayısı</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>{result.repeat}</p>
                      </div>
                    </div>
                  </div>

                  {/* Server Status */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dcfce7'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: '#16a34a', fontSize: '20px' }}>🌍</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Sunucu yeşil mi?</p>
                        <p style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold', 
                          color: '#16a34a',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          {result.isGreen ? "EVET" : "HAYIR"}
                          {result.isGreen && <span style={{ marginLeft: '4px' }}>✅</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Data Size */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dcfce7'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#f3e8ff',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: '#9333ea', fontSize: '20px' }}>📦</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Veri boyutu</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          {(result.totalBytes / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CO2 Estimate */}
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dcfce7'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#d1fae5',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ color: '#059669', fontSize: '20px' }}>🌱</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>CO2 Tahmini</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.estimatedCO2.toFixed(4)} gram
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          // CodeCarbon Tracker Content
          <CodeCarbonTracker />
        )}
      </div>
    </div>
  );
}

export default App;
