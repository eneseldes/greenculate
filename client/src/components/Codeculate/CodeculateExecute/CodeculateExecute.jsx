import { useState } from "react";
import CodeculateResults from "./CodeculateResults/CodeculateResults";
import CodeEditor from "../../Editors/CodeEditor";
import SubmitButton from "../../SubmitButton/SubmitButton";
import AnimatedItem from "../../AnimatedItem";

function CodeculateExecute() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    code: `# Python example code
import time
import math

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test
for i in range(10):
    print(f"Fibonacci({i}) = {fibonacci(i)}")
    time.sleep(0.1)`,
    language: "python",
    repeat: 5,
    scaleThreshold: 10000,
  });

  const handleLanguageChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "repeat" || name === "scaleThreshold" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          repeat: formData.repeat,
          scaleThreshold: formData.scaleThreshold,
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
      {/* Codeculate Form */}
      <form className="form codeculate-form" onSubmit={handleSubmit}>
        {/* Language and Repeat Row */}
        <div className="form-row">
          <div className="form-group">
            <label>Programlama Dili</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleLanguageChange}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tekrar Sayısı</label>
            <input
              type="number"
              name="repeat"
              value={formData.repeat}
              min={1}
              onChange={handleLanguageChange}
            />
          </div>
          <div className="form-group">
            <div className="label-with-info">
              <label>Ölçeklendirme Eşiği</label>
              <div
                className="info-icon"
                title="Belirli bir tekrar sayısından sonra, sonuçlar ölçeklendirilerek hesaplanır. Ortalama bir bilgisayar kullanıyorsanız varsayılan değeri (10000) kullanmanız önerilir. Güçlü bir bilgisayarınız varsa bu değeri artırabilirsiniz."
              >
                ℹ️
              </div>
            </div>
            <input
              type="number"
              name="scaleThreshold"
              value={formData.scaleThreshold}
              min={1000}
              step={1000}
              onChange={handleLanguageChange}
            />
          </div>
        </div>
        {/* Code Editor */}
        <div className="form-group">
          <label>Kodunuz</label>
          <CodeEditor
            language={formData.language}
            code={formData.code}
            onCodeChange={(val) => setFormData((p) => ({ ...p, code: val }))}
            height="400px"
          />
        </div>
        <SubmitButton loading={loading} />
      </form>
      <CodeculateResults result={result} />
      {error && <div className="error">{error}</div>}
    </AnimatedItem>
  );
}

export default CodeculateExecute;
