import React, { useState } from "react";
import axios from "axios";
import "./HTTPculateExecute.scss";
import SubmitButton from "../../SubmitButton/SubmitButton";
import HTTPculateResults from "./HTTPculateResults/HTTPculateResults";

const SUPPORTED_LIBRARIES = ["axios", "node-fetch", "http"];
const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

function HTTPRequestExecute() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("response");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.target);
    const library = form.get("library");
    const method = form.get("method");
    const url = form.get("url");
    let headers = form.get("headers");
    let body = form.get("body");

    // Headers parse
    let parsedHeaders = {};
    if (headers.trim()) {
      try {
        parsedHeaders = JSON.parse(headers);
      } catch {
        setError("Headers must be a valid JSON object");
        setLoading(false);
        return;
      }
    }

    try {
      const result = await axios.post("http://localhost:3000/request", {
        library,
        method,
        url,
        headers: parsedHeaders,
        body,
        repeat: 1,
      });
      setResponse(result.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="form httpculate-form" onSubmit={handleSubmit}>
        <div className="form-row-2">
          <div className="form-group">
            <label>HTTP Library</label>
            <select name="library" defaultValue="axios">
              {SUPPORTED_LIBRARIES.map((lib) => (
                <option key={lib} value={lib}>{lib}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Method</label>
            <select name="method" defaultValue="GET">
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m}>{m}</option>
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

        <div className="form-group">
          <label>Headers (JSON)</label>
          <textarea name="headers" placeholder='{"Content-Type": "application/json"}' />
        </div>

        <div className="form-group">
          <label>Body</label>
          <textarea name="body" placeholder='{"key":"value"}' />
        </div>

        <SubmitButton loading={loading} />
      </form>

      <HTTPculateResults result={response} />

      {error && <div className="error">{error}</div>}
    </>
  );
}

export default HTTPRequestExecute;
