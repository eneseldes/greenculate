import { useState, useEffect } from "react";

function ExecutionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <p>Loading execution history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#6b7280'
      }}>
        <p>No execution history found.</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {history.map((record, index) => (
        <div
          key={index}
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            border: '1px solid #dcfce7'
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Language and Timestamp */}
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Language</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                {record.programming_language}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Execution Time</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                {new Date(record.execution_time).toLocaleString()}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '16px',
            marginBottom: '16px'
          }}>
            {/* Metrics */}
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Total Emissions</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                {record.total_carbon_emission ? record.total_carbon_emission.toExponential(4) : '0'} (kg CO₂)
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Per Execution</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                {record.carbon_per_execution ? record.carbon_per_execution.toExponential(4) : '0'} (kg CO₂)
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Execution Count</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                {record.execution_count}x
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Duration</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                {record.execution_duration_seconds ? record.execution_duration_seconds.toFixed(2) : '0'}s
              </p>
            </div>
          </div>

          {/* System Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>CPU Model</p>
              <p style={{ fontSize: '14px', color: '#1f2937' }}>{record.cpu_model}</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>RAM</p>
              <p style={{ fontSize: '14px', color: '#1f2937' }}>{record.total_ram_gb ? record.total_ram_gb.toFixed(2) : '0'} GB</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Location</p>
              <p style={{ fontSize: '14px', color: '#1f2937' }}>
                {record.country_name || 'Unknown'} ({record.country_iso_code || 'N/A'})
              </p>
            </div>
          </div>

          {/* Code Preview */}
          <div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Code Preview</p>
            <pre style={{
              fontSize: '14px',
              backgroundColor: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              maxHeight: '200px'
            }}>
              {record.code_text}
            </pre>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExecutionHistory;
