import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import axios from "axios";
import JSONParsingHistory from "../JSONParsingHistory/JSONParsingHistory";
import "./JSONParsingPanel.scss";

function JSONParser() {
  const [jsonInput, setJsonInput] = useState(`{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "country": "USA"
      },
      "orders": [
        {
          "orderId": "ORD-001",
          "items": [
            {
              "productId": "P100",
              "name": "Laptop",
              "price": 999.99,
              "quantity": 1
            },
            {
              "productId": "P101",
              "name": "Mouse",
              "price": 29.99,
              "quantity": 2
            }
          ],
          "totalAmount": 1059.97,
          "status": "delivered"
        }
      ],
      "active": true,
      "registrationDate": "2024-01-15T10:30:00Z"
    }
  ],
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2024-02-20T15:45:00Z"
  }
}`);
  const [iterations, setIterations] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("parse"); // 'parse' or 'history'

  // Custom theme that matches the page style
  const customTheme = EditorView.theme({
    "&": {
      color: "#374151",
      backgroundColor: "#ffffff",
    },
    ".cm-content": {
      caretColor: "#059669",
      fontFamily: "monospace",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#059669",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#059669",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "#d1fae5",
      },
    ".cm-panels": {
      backgroundColor: "#f9fafb",
      color: "#374151",
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid #e5e7eb",
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid #e5e7eb",
    },
    ".cm-searchMatch": {
      backgroundColor: "#fef3c7",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#f59e0b",
    },
    ".cm-activeLine": {
      backgroundColor: "#f0fdf4",
    },
    ".cm-selectionMatch": {
      backgroundColor: "#d1fae5",
    },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      color: "#059669",
      borderBottom: "1px solid #059669",
    },
    ".cm-gutters": {
      backgroundColor: "#f9fafb",
      color: "#6b7280",
      border: "none",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f0fdf4",
      color: "#059669",
    },
    ".cm-foldGutter .cm-gutterElement": {
      color: "#6b7280",
    },
    ".cm-activeLineGutter .cm-foldGutter .cm-gutterElement": {
      color: "#059669",
    },
  });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post("http://localhost:5000/parse-json", {
        json: jsonInput,
        iterations: parseInt(iterations),
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="json-parsing-panel">
        <>
          {/* JSON Parser Form */}
          <div className="jp__card">
            <div className="jp__flex">
              {/* Options Column */}
              <div className="jp__sidebar">
                {/* Parser Info */}
                <div className="jp__mb-24">
                  <h4 className="jp__h4">Kullanılan Parser'lar</h4>
                  <div className="jp__col">
                    <div className="jp__info">
                      <div className="jp__row">
                        <span className="jp__icon jp__icon--green">📝</span>
                        <p className="jp__info-title">json</p>
                      </div>
                      <p className="jp__info-desc">
                        Python'un standart JSON modülü. Güvenilir ve yaygın
                        kullanılan temel parser.
                      </p>
                    </div>

                    <div className="jp__info">
                      <div className="jp__row">
                        <span className="jp__icon jp__icon--blue">⚡</span>
                        <p className="jp__info-title">orjson</p>
                      </div>
                      <p className="jp__info-desc">
                        Rust ile yazılmış, yüksek performanslı JSON parser.
                        Büyük JSON'lar için optimize edilmiş.
                      </p>
                    </div>

                    <div className="jp__info">
                      <div className="jp__row">
                        <span className="jp__icon jp__icon--purple">🚀</span>
                        <p className="jp__info-title">ujson</p>
                      </div>
                      <p className="jp__info-desc">
                        C ile yazılmış, ultra hızlı JSON parser. Hafif ve
                        minimal özelliklerle optimize edilmiş.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Iterations Input */}
                <div className="jp__mb-24">
                  <label className="jp__label">Tekrar Sayısı</label>
                  <input
                    type="number"
                    value={iterations}
                    min={1}
                    max={50000}
                    onChange={(e) => setIterations(e.target.value)}
                    className="jp__input"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`jp__btn ${loading ? "is-loading" : "is-primary"}`}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.target.style.background =
                        "linear-gradient(135deg, #16a34a 0%, #047857 100%)";
                      e.target.style.transform = "scale(1.02)";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loading) {
                      e.target.style.background =
                        "linear-gradient(135deg, #22c55e 0%, #059669 100%)";
                      e.target.style.transform = "scale(1)";
                    }
                  }}
                >
                  {loading ? "İşleniyor..." : "JSON Parse Et"}
                </button>
              </div>

              {/* JSON Editor */}
              <div className="jp__editor-wrap">
                <label className="jp__label">JSON İçeriği</label>
                <div className="jp__editor">
                  <CodeMirror
                    value={jsonInput}
                    onChange={(value) => setJsonInput(value)}
                    extensions={[json(), customTheme]}
                    height="400px"
                    className="jp__cm"
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLineGutter: true,
                      highlightSpecialChars: true,
                      foldGutter: true,
                      drawSelection: true,
                      dropCursor: true,
                      allowMultipleSelections: true,
                      indentOnInput: true,
                      bracketMatching: true,
                      closeBrackets: true,
                      autocompletion: true,
                      rectangularSelection: true,
                      crosshairCursor: true,
                      highlightActiveLine: true,
                      highlightSelectionMatches: true,
                      closeBracketsKeymap: true,
                      defaultKeymap: true,
                      searchKeymap: true,
                      historyKeymap: true,
                      foldKeymap: true,
                      completionKeymap: true,
                      lintKeymap: true,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="jp__result">
              <div className="jp__result-head">
                <h3 className="jp__result-title">Parse Sonuçları</h3>
                {result.scaled && (
                  <div className="jp__pill jp__pill--amber">
                    1000 tekrar üzerinden ölçeklendirildi
                  </div>
                )}
                {result.from_cache && (
                  <div className="jp__pill jp__pill--blue">
                    Önbellekten alındı
                  </div>
                )}
              </div>

              {/* Parser Results */}
              <div className="jp__grid">
                {/* JSON Parser */}
                <div className="jp__parser-card">
                  <div className="jp__parser-head">
                    <div className="jp__avatar jp__avatar--green">
                      <span className="jp__emoji">📝</span>
                    </div>
                    <div>
                      <p className="jp__parser-name">json</p>
                      <p className="jp__parser-caption">Standart JSON Parser</p>
                    </div>
                  </div>
                  <div className="jp__stats">
                    <div>
                      <p className="jp__muted">Emisyon</p>
                      <p className="jp__value">
                        {result.json.emissions.toFixed(6)} kg CO₂
                      </p>
                    </div>
                    <div>
                      <p className="jp__muted">Süre</p>
                      <p className="jp__value">
                        {result.json.duration.toFixed(2)} saniye
                      </p>
                    </div>
                  </div>
                </div>

                {/* orjson Parser */}
                <div className="jp__parser-card">
                  <div className="jp__parser-head">
                    <div className="jp__avatar jp__avatar--blue">
                      <span className="jp__emoji">⚡</span>
                    </div>
                    <div>
                      <p className="jp__parser-name">orjson</p>
                      <p className="jp__parser-caption">
                        Rust-tabanlı Hızlı Parser
                      </p>
                    </div>
                  </div>
                  <div className="jp__stats">
                    <div>
                      <p className="jp__muted">Emisyon</p>
                      <p className="jp__value">
                        {result.orjson.emissions.toFixed(6)} kg CO₂
                      </p>
                    </div>
                    <div>
                      <p className="jp__muted">Süre</p>
                      <p className="jp__value">
                        {result.orjson.duration.toFixed(2)} saniye
                      </p>
                    </div>
                  </div>
                </div>

                {/* ujson Parser */}
                <div className="jp__parser-card">
                  <div className="jp__parser-head">
                    <div className="jp__avatar jp__avatar--purple">
                      <span className="jp__emoji">🚀</span>
                    </div>
                    <div>
                      <p className="jp__parser-name">ujson</p>
                      <p className="jp__parser-caption">
                        Ultra Hızlı JSON Parser
                      </p>
                    </div>
                  </div>
                  <div className="jp__stats">
                    <div>
                      <p className="jp__muted">Emisyon</p>
                      <p className="jp__value">
                        {result.ujson.emissions.toFixed(6)} kg CO₂
                      </p>
                    </div>
                    <div>
                      <p className="jp__muted">Süre</p>
                      <p className="jp__value">
                        {result.ujson.duration.toFixed(2)} saniye
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Info */}
              {result.system_info && (
                <div className="jp__sys">
                  <h4 className="jp__h4">Sistem Bilgileri</h4>
                  <div className="jp__sys-grid">
                    <div>
                      <p className="jp__muted">İşlemci</p>
                      <p className="jp__sys-val">
                        {result.system_info.cpu_model}
                      </p>
                    </div>
                    <div>
                      <p className="jp__muted">CPU Sayısı</p>
                      <p className="jp__sys-val">
                        {result.system_info.cpu_count} çekirdek
                      </p>
                    </div>
                    <div>
                      <p className="jp__muted">RAM</p>
                      <p className="jp__sys-val">
                        {result.system_info.total_memory} GB
                      </p>
                    </div>
                    <div>
                      <p className="jp__muted">İşletim Sistemi</p>
                      <p className="jp__sys-val">
                        {result.system_info.os_info}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="jp__error">
              <div className="jp__row">
                <div className="jp__err-ico">
                  <span className="jp__err-emoji">⚠️</span>
                </div>
                <div>
                  <p className="jp__err-title">Hata</p>
                  <p className="jp__err-text">{error}</p>
                </div>
              </div>
            </div>
          )}
        </>
    </div>
  );
}

export default JSONParser;
