import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HTTPRequestHistory.scss';

function HTTPRequestHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3000/request/history');
      setHistory(response.data);
    } catch (error) {
      setError('Failed to load request history');
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/request/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="http-request-history">
      <div className="history-header">
        <h2>HTTP Request History</h2>
      </div>

      {stats && (
        <div className="stats-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            {stats.by_library.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-header">
                  <span className="library">{stat.library}</span>
                  <span className="green-server">{stat.green_server_percentage || '0'}% Green Servers</span>
                </div>
                <div className="stat-body">
                  <div className="stat-item">
                    <span>Total Requests:</span>
                    <span>{stat.total_requests || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span>Total Emissions:</span>
                    <span>{stat.total_emissions ? `${stat.total_emissions.toFixed(6)} g CO₂` : '0 g CO₂'}</span>
                  </div>
                  <div className="stat-item">
                    <span>Avg Emissions:</span>
                    <span>{stat.avg_emissions ? `${stat.avg_emissions.toFixed(6)} g CO₂` : '0 g CO₂'}</span>
                  </div>
                  <div className="stat-item">
                    <span>Total Data:</span>
                    <span>{stat.total_bytes ? `${(stat.total_bytes / 1024).toFixed(2)} KB` : '0 KB'}</span>
                  </div>
                  <div className="stat-item">
                    <span>Green Servers:</span>
                    <span className={Number(stat.green_server_percentage) > 50 ? 'success' : 'warning'}>
                      {stat.green_server_percentage || '0'}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="history-list">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Method</th>
              <th>URL</th>
              <th>Library</th>
              <th>Carbon Emissions</th>
              <th>Data Size</th>
              <th>Green Server</th>
            </tr>
          </thead>
          <tbody>
            {history.map((request) => (
              <tr
                key={request.timestamp}
                onClick={() => setSelectedRequest(request)}
                className={request.error ? 'error' : ''}
              >
                <td>{formatDate(request.timestamp)}</td>
                <td className="method">{request.method}</td>
                <td className="url">{request.url}</td>
                <td>{request.library}</td>
                <td className="emissions">{request.estimatedCO2.toFixed(6)} g CO₂</td>
                <td>{request.totalBytes ? `${(request.totalBytes / 1024).toFixed(2)} KB` : '0 KB'}</td>
                <td className={request.isGreen ? 'success' : 'warning'}>
                  {request.isGreen ? '✅ Yes' : '⚠️ No'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="request-details">
          <h3>Request Details</h3>
          <div className="details-grid">
            <div className="detail-section">
              <h4>Request Information</h4>
              <div className="detail-content">
                <div className="detail-item">
                  <span className="label">Method:</span>
                  <span className="value">{selectedRequest.method}</span>
                </div>
                <div className="detail-item">
                  <span className="label">URL:</span>
                  <span className="value url">{selectedRequest.url}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Library:</span>
                  <span className="value">{selectedRequest.library}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Timestamp:</span>
                  <span className="value">{formatDate(selectedRequest.timestamp)}</span>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4>Carbon Impact</h4>
              <div className="detail-content">
                <div className="detail-item">
                  <span className="label">Carbon Emissions:</span>
                  <span className="value highlight">{selectedRequest.estimatedCO2.toFixed(6)} g CO₂</span>
                </div>
                <div className="detail-item">
                  <span className="label">Data Transferred:</span>
                  <span className="value">{(selectedRequest.totalBytes / 1024).toFixed(2)} KB</span>
                </div>
                <div className="detail-item">
                  <span className="label">Green Hosting:</span>
                  <span className={`value ${selectedRequest.isGreen ? 'success' : 'warning'}`}>
                    {selectedRequest.isGreen ? '✅ Yes' : '⚠️ No'}
                  </span>
                </div>
              </div>
            </div>
            {selectedRequest.error && (
              <div className="detail-section error">
                <h4>Error</h4>
                <div className="detail-content">
                  <pre>{selectedRequest.error}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HTTPRequestHistory;