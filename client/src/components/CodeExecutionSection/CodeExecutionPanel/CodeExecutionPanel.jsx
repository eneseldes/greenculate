import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import CodeExecutionHistory from "../CodeExecutionHistory/CodeExecutionHistory.jsx";
import "./CodeExecutionPanel.scss";

function CodeCarbonTracker() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("execute"); // 'execute' or 'history'

  // Her dil için ayrı kod tutacak state
  const [savedCodes, setSavedCodes] = useState({
    python: null,
    javascript: null,
    java: null,
    cpp: null,
    c: null,
  });

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
  });

  // Update code example when language changes
  const examples = {
    python: `# Python example code
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
    javascript: `// JavaScript example code
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

// Test
for (let i = 0; i < 10; i++) {
    console.log(\`Fibonacci(\${i}) = \${fibonacci(i)}\`);
}
setTimeout(() => {}, 100);`,
    java: `// Java example code
public class Main {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n-1) + fibonacci(n-2);
    }
    
    public static void main(String[] args) {
        for (int i = 0; i < 10; i++) {
            System.out.println("Fibonacci(" + i + ") = " + fibonacci(i));
        }
    }
}`,
    cpp: `// C++ example code
#include <iostream>
#include <chrono>
#include <thread>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        std::cout << "Fibonacci(" << i << ") = " << fibonacci(i) << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
    return 0;
}`,
    c: `// C example code
#include <stdio.h>
#include <unistd.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        printf("Fibonacci(%d) = %d\\n", i, fibonacci(i));
        usleep(100000); // 100ms
    }
    return 0;
}`,
  };

  // Dil değiştiğinde kaydedilmiş kodu veya varsayılan örneği kullan
  useEffect(() => {
    const savedCode = savedCodes[formData.language];
    setFormData((prev) => ({
      ...prev,
      code: savedCode !== null ? savedCode : examples[formData.language],
    }));
  }, [formData.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "repeat" ? Number(value) : value,
    }));
  };

  const getLanguageExtension = (language) => {
    switch (language.toLowerCase()) {
      case "python":
        return python();
      case "javascript":
        return javascript();
      case "java":
        return java();
      case "cpp":
      case "c":
        return cpp();
      default:
        return python();
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      console.log("CodeCarbon backend'e istek gönderiliyor...", {
        code: formData.code,
        language: formData.language,
        repeat: formData.repeat,
      });

      const response = await fetch("http://localhost:5000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          repeat: formData.repeat,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("CodeCarbon backend'den gelen veri:", data);
      setResult(data);
    } catch (error) {
      console.error("Hata:", error);
      alert(
        `Kod emisyon hesaplama hatası: ${error.message}\n\nPython backend server'ın çalıştığından emin olun:\npython app.py`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="code-execution-panel">
      <>
        {/* Code Execution Form */}
        <form onSubmit={handleSubmit}>
          {/* Language and Repeat Row */}
          <div className="row">
            <div className="group">
              <label>Programlama Dili</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>
            <div className="group">
              <label>Tekrar Sayısı</label>
              <input
                type="number"
                name="repeat"
                value={formData.repeat}
                min={1}
                max={50}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Code Editor */}
          <div className="group">
            <label>Kodunuz</label>
            <div className="editor">
              <CodeMirror
                value={formData.code}
                onChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    code: value,
                  }));
                  setSavedCodes((prev) => ({
                    ...prev,
                    [formData.language]: value,
                  }));
                }}
                extensions={[
                  getLanguageExtension(formData.language),
                  customTheme,
                ]}
                height="400px"
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

          {/* Submit Button */}
          <div className="submit">
            <button type="submit" disabled={loading}>
              {loading ? "Hesaplanıyor..." : "Emisyon Hesapla"}
            </button>
          </div>
        </form>

        {/* Results */}
        {result && (
          <div className="results">
            <div className="title">Hesaplama Sonuçları</div>
            <div className="grid">
              {/* Total Emissions */}
              <div className="card">
                <div className="card-content">
                  <div className="card-icon green">
                    <span>🌱</span>
                  </div>
                  <div className="card-text">
                    <p className="label">Toplam Emisyon</p>
                    <p className="value">
                      {result.total_emissions.toFixed(6)} kg CO₂
                    </p>
                  </div>
                </div>
              </div>

              {/* Average Emissions */}
              <div className="card">
                <div className="card-content">
                  <div className="card-icon blue">
                    <span>📊</span>
                  </div>
                  <div className="card-text">
                    <p className="label">Ortalama Emisyon</p>
                    <p className="value">
                      {result.avg_emissions.toFixed(6)} kg CO₂
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution Time */}
              <div className="card">
                <div className="card-content">
                  <div className="card-icon purple">
                    <span>⏱️</span>
                  </div>
                  <div className="card-text">
                    <p className="label">Toplam Süre</p>
                    <p className="value">
                      {result.total_execution_time.toFixed(2)} saniye
                    </p>
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="card">
                <div className="card-content">
                  <div className="card-icon green">
                    <span>✅</span>
                  </div>
                  <div className="card-text">
                    <p className="label">Başarı Oranı</p>
                    <p className="value">
                      {result.successful_runs}/{result.repeat} (
                      {((result.successful_runs / result.repeat) * 100).toFixed(
                        1
                      )}
                      %)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Result Details */}
            {result.last_result && (
              <div className="details">
                <h4 className="title">Son Çalıştırma Detayları</h4>
                <div className="grid">
                  <div className="details-item">
                    <p className="label">Durum</p>
                    <p
                      className={`value ${
                        result.last_result.success ? "success" : "error"
                      }`}
                    >
                      {result.last_result.success ? "Başarılı" : "Başarısız"}
                    </p>
                  </div>
                  <div className="details-item">
                    <p className="label">Çalışma Süresi</p>
                    <p className="value">
                      {result.last_result.execution_time.toFixed(2)} saniye
                    </p>
                  </div>
                  <div className="details-item">
                    <p className="label">Emisyon</p>
                    <p className="value">
                      {result.last_result.emissions.toFixed(6)} kg CO₂
                    </p>
                  </div>
                </div>

                {/* Output */}
                {result.last_result.stdout && (
                  <div className="output">
                    <p className="label">Çıktı:</p>
                    <pre>{result.last_result.stdout}</pre>
                  </div>
                )}

                {/* Error */}
                {result.last_result.stderr && (
                  <div className="error">
                    <p className="label">Hata:</p>
                    <pre>{result.last_result.stderr}</pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </>
    </div>
  );
}

export default CodeCarbonTracker;
