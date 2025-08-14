import { useState } from "react";
import axios from "axios";
import JSONEditor from "../../Editors/JSONEditor";
import JSONculateResults from "./JSONculateResults/JSONculateResults";
import SubmitButton from "../../SubmitButton/SubmitButton";
import "./JSONculateExecute.scss";
import AnimatedItem from "../../AnimatedItem";

function JSONculatePanel() {
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
  const [repeat, setRepeat] = useState(1);
  const [scaleThreshold, setScaleThreshold] = useState(10000);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/jsonculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
            json: jsonInput,
            repeat: parseInt(repeat, 10),
            scaleThreshold: parseInt(scaleThreshold, 10),
          }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedItem>
      <form className="form jsonculate-form" onSubmit={handleSubmit}>
        <div className="content">
          <div className="left-box">
            <div className="form-group">
              <label>Kullanılan Parser'lar</label>
              <div className="parsers">
                <div className="parser-card">
                  <div className="row">
                    <span className="icon">📝</span>
                    <p className="info-title">json</p>
                  </div>
                  <p className="info-desc">
                    Python'un standart JSON modülü. Güvenilir ve yaygın
                    kullanılan temel parser.
                  </p>
                </div>

                <div className="parser-card">
                  <div className="row">
                    <span className="icon">⚡</span>
                    <p className="info-title">orjson</p>
                  </div>
                  <p className="info-desc">
                    Rust ile yazılmış, yüksek performanslı JSON parser. Büyük
                    JSON'lar için optimize edilmiş.
                  </p>
                </div>

                <div className="parser-card">
                  <div className="row">
                    <span className="icon">🚀</span>
                    <p className="info-title">ujson</p>
                  </div>
                  <p className="info-desc">
                    C ile yazılmış, ultra hızlı JSON parser. Hafif ve minimal
                    özelliklerle optimize edilmiş.
                  </p>
                </div>
              </div>
            </div>

            {/* repeat Input */}
            <div className="form-group">
              <label>Tekrar Sayısı</label>
              <input
                type="number"
                value={repeat}
                min={1}
                onChange={(e) => setRepeat(e.target.value)}
              />
            </div>

            {/* scale threshold Input */}
            <div className="form-group">
              <div className="label-with-info">
                <label>Ölçeklendirme Eşiği</label>
                <div className="info-icon" title="Belirli bir tekrar sayısından sonra, sonuçlar ölçeklendirilerek hesaplanır. Ortalama bir bilgisayar kullanıyorsanız varsayılan değeri (10000) kullanmanız önerilir. Güçlü bir bilgisayarınız varsa bu değeri artırabilirsiniz.">ℹ️</div>
              </div>
              <input
                type="number"
                value={scaleThreshold}
                min={1000}
                step={1000}
                onChange={(e) => setScaleThreshold(e.target.value)}
              />
            </div>
            <SubmitButton loading={loading} />
          </div>

          {/* JSON Editor */}
          <div className="form-group editor-area">
            <label>JSON İçeriği</label>
            <JSONEditor
              value={jsonInput}
              onChange={(val) => setJsonInput(val)}
              height="480px"
            />
          </div>
        </div>
      </form>
      <JSONculateResults result={result} />
      {error && <div className="error">{error}</div>}
    </AnimatedItem>
  );
}

export default JSONculatePanel;
