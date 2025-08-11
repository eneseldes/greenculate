import React, { useState } from 'react';
import axios from 'axios';
import './HTTPRequestPanel.scss';

const SUPPORTED_LIBRARIES = ['axios', 'node-fetch', 'http'];

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

function HTTPRequestPanel() {
  const [library, setLibrary] = useState('axios');
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [activeTab, setActiveTab] = useState('response');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Headers'ı JSON objesine çevir
      let parsedHeaders = {};
      if (headers.trim()) {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch (err) {
          setError('Headers must be a valid JSON object');
          setLoading(false);
          return;
        }
      }

      // Body'yi kontrol et
      let parsedBody = body;
      if (body.trim()) {
        try {
          // Eğer JSON ise parse et
          JSON.parse(body);
        } catch {
          // JSON değilse string olarak bırak
        }
      }

      const result = await axios.post('http://localhost:3000/request', {
        library,
        method,
        url,
        headers: parsedHeaders,
        body: parsedBody,
        repeat: 1
      });

      setResponse(result.data);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="http-request-panel">

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>HTTP Library</label>
            <select
              value={library}
              onChange={(e) => setLibrary(e.target.value)}
            >
              {SUPPORTED_LIBRARIES.map(lib => (
                <option key={lib} value={lib}>{lib}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              {HTTP_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Headers (JSON)</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder='{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer token"\n}'
          />
        </div>

        <div className="form-group">
          <label>Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{\n  "key": "value"\n}'
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>

      {response && (
        <div className="response-section">
          <div className="response-header">
            <span className={`status ${response.status && response.status < 400 ? 'success' : 'error'}`}>
              Status: {response.status || 'N/A'}
            </span>
            <span className="response-time">
              {response.execution_time ? `${(response.execution_time * 1000).toFixed(2)} ms` : 'N/A'}
            </span>
          </div>

          <div className="response-tabs">
            <div className="tab-list">
              <button
                className={activeTab === 'response' ? 'active' : ''}
                onClick={() => setActiveTab('response')}
              >
                Response
              </button>
              <button
                className={activeTab === 'headers' ? 'active' : ''}
                onClick={() => setActiveTab('headers')}
              >
                Headers
              </button>
              <button
                className={activeTab === 'body' ? 'active' : ''}
                onClick={() => setActiveTab('body')}
              >
                Body
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'response' && (
                <div>
                  <div className="response-details">
                    <div className="detail-item">
                      <span className="label">Status:</span>
                      <span className={`value ${response.status < 400 ? 'success' : 'error'}`}>
                        {response.status || 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Library:</span>
                      <span className="value">{library}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Carbon Emissions:</span>
                      <span className="value highlight">
                        {response.emissions ? `${response.emissions.toFixed(6)} g CO₂` : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Data Transferred:</span>
                      <span className="value">
                        {response.total_bytes ? `${(response.total_bytes / 1024).toFixed(2)} KB` : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Green Hosting:</span>
                      <span className={`value ${response.is_green_hosting ? 'success' : 'warning'}`}>
                        {response.is_green_hosting ? '✅ Yes' : '⚠️ No'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Execution Time:</span>
                      <span className="value">
                        {response.execution_time ? `${(response.execution_time * 1000).toFixed(2)} ms` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'headers' && (
                <div>
                  <pre>
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
              )}

              {activeTab === 'body' && (
                <div>
                  <pre>
                    {typeof response.body === 'string'
                      ? response.body
                      : JSON.stringify(response.body, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HTTPRequestPanel;