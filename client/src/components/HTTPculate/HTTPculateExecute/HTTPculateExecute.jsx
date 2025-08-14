/**
 * HTTPculateExecute Bileşeni
 * =================================================================
 * HTTP isteklerinin karbon emisyonunu hesaplama formu. Farklı HTTP kütüphaneleri
 * kullanarak yapılan isteklerin çevresel etkisini ölçer.
 */

import React, { useState } from "react";
import axios from "axios";
import SubmitButton from "../../SubmitButton/SubmitButton";
import HTTPculateResults from "./HTTPculateResults/HTTPculateResults";
import AnimatedItem from "../../AnimatedItem";
import "./HTTPculateExecute.scss";

// Desteklenen HTTP kütüphaneleri listesi
const SUPPORTED_LIBRARIES = ["axios", "node-fetch", "http"];

// Desteklenen HTTP metodları listesi
const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "DELETE",
  "PATCH",
  "HEAD",
  "OPTIONS",
];

function HTTPRequestExecute() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  // Backend'e HTTP isteği gönderir ve emisyon hesaplaması yapar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form verilerini al
    const form = new FormData(e.target);
    const library = form.get("library");
    const method = form.get("method");
    const url = form.get("url");

    try {
      // Node.js backend'e POST isteği gönder
      const result = await axios.post("http://localhost:3000/httpculate/execute", {
        library,
        method,
        url,
        repeat: 1, // Burası formdan gelecek
      });
      
      // Başarılı yanıtı state'e kaydet
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedItem>
      <form className="form httpculate-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>HTTP Library</label>
            <select name="library" defaultValue="axios">
              {SUPPORTED_LIBRARIES.map((lib) => (
                <option key={lib} value={lib}>
                  {lib}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Method</label>
            <select name="method" defaultValue="GET">
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>URL</label>
          <input
            type="url"
            name="url"
            placeholder="https://api.example.com"
            required
          />
        </div>
        <SubmitButton loading={loading} />
      </form>
      <HTTPculateResults result={response} />
      {error && <div className="error">{error}</div>}
    </AnimatedItem>
  );
}

export default HTTPRequestExecute;
