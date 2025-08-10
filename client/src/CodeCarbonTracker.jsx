import { useState, useEffect } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView } from '@codemirror/view';
import ExecutionHistory from './ExecutionHistory.jsx';

function CodeCarbonTracker() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('execute'); // 'execute' or 'history'
  
  // Her dil için ayrı kod tutacak state
  const [savedCodes, setSavedCodes] = useState({
    python: null,
    javascript: null,
    java: null,
    cpp: null,
    c: null
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
    repeat: 5
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
}`
  };

  // Dil değiştiğinde kaydedilmiş kodu veya varsayılan örneği kullan
  useEffect(() => {
    const savedCode = savedCodes[formData.language];
    setFormData(prev => ({
      ...prev,
      code: savedCode !== null ? savedCode : examples[formData.language]
    }));
  }, [formData.language]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "repeat" ? Number(value) : value
    }));
  };

  const getLanguageExtension = (language) => {
    switch (language.toLowerCase()) {
      case 'python':
        return python();
      case 'javascript':
        return javascript();
      case 'java':
        return java();
      case 'cpp':
      case 'c':
        return cpp();
      default:
        return python();
    }
  };

  // Custom theme that matches the page style
  const customTheme = EditorView.theme({
    "&": {
      color: "#374151",
      backgroundColor: "#ffffff"
    },
    ".cm-content": {
      caretColor: "#059669",
      fontFamily: "monospace"
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "#059669"
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#059669"
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "#d1fae5"
    },
    ".cm-panels": {
      backgroundColor: "#f9fafb",
      color: "#374151"
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid #e5e7eb"
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid #e5e7eb"
    },
    ".cm-searchMatch": {
      backgroundColor: "#fef3c7"
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "#f59e0b"
    },
    ".cm-activeLine": {
      backgroundColor: "#f0fdf4"
    },
    ".cm-selectionMatch": {
      backgroundColor: "#d1fae5"
    },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      color: "#059669",
      borderBottom: "1px solid #059669"
    },
    ".cm-gutters": {
      backgroundColor: "#f9fafb",
      color: "#6b7280",
      border: "none"
    },
    ".cm-activeLineGutter": {
      backgroundColor: "#f0fdf4",
      color: "#059669"
    },
    ".cm-foldGutter .cm-gutterElement": {
      color: "#6b7280"
    },
    ".cm-activeLineGutter .cm-foldGutter .cm-gutterElement": {
      color: "#059669"
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    try {
      console.log("CodeCarbon backend'e istek gönderiliyor...", {
        code: formData.code,
        language: formData.language,
        repeat: formData.repeat
      });

      const response = await fetch("http://localhost:5000/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          language: formData.language,
          repeat: formData.repeat
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("CodeCarbon backend'den gelen veri:", data);
      setResult(data);
    } catch (error) {
      console.error("Hata:", error);
      alert(`Kod emisyon hesaplama hatası: ${error.message}\n\nPython backend server'ın çalıştığından emin olun:\npython app.py`);
    } finally {
      setLoading(false);
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
        {/* View Selection Buttons */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setActiveView('execute')}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeView === "execute"
                ? 'linear-gradient(135deg, #22c55e 0%, #059669 100%)'
                : '#f3f4f6',
              color: activeView === "execute" ? 'white' : '#374151'
            }}
          >
            💻 Execute Code
          </button>
          <button
            onClick={() => setActiveView('history')}
            style={{
              flex: 1,
              padding: '16px 24px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: activeView === "history"
                ? 'linear-gradient(135deg, #22c55e 0%, #059669 100%)'
                : '#f3f4f6',
              color: activeView === "history" ? 'white' : '#374151'
            }}
          >
            📊 Execution History
          </button>
        </div>

        {/* Active View Content */}
        {activeView === 'execute' ? (
          <>
            {/* Code Execution Form */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              padding: '32px',
              border: '1px solid #dcfce7'
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Language and Repeat Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                      Programlama Dili
                    </label>
                    <select
                      name="language"
                      value={formData.language}
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
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="c">C</option>
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
                      Tekrar Sayısı
                    </label>
                    <input
                      type="number"
                      name="repeat"
                      value={formData.repeat}
                      min={1}
                      max={50}
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

                {/* Code Editor */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '8px'
                  }}>
                    Kodunuz
                  </label>
                  <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.2s'
                  }}>
                    <CodeMirror
                      value={formData.code}
                      onChange={(value) => {
                        // Kodu formData'da güncelle
                        setFormData((prev) => ({
                          ...prev,
                          code: value
                        }));
                        // Kodu seçili dilin state'inde sakla
                        setSavedCodes((prev) => ({
                          ...prev,
                          [formData.language]: value
                        }));
                      }}
                      extensions={[getLanguageExtension(formData.language), customTheme]}
                      height="400px"
                      style={{
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}
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
                        lintKeymap: true
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ paddingTop: '16px' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      background: loading 
                        ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                        : 'linear-gradient(135deg, #22c55e 0%, #059669 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      padding: '16px 24px',
                      borderRadius: '12px',
                      fontSize: '18px',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseOver={(e) => {
                      if (!loading) {
                        e.target.style.background = 'linear-gradient(135deg, #16a34a 0%, #047857 100%)';
                        e.target.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!loading) {
                        e.target.style.background = 'linear-gradient(135deg, #22c55e 0%, #059669 100%)';
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {loading ? 'Hesaplanıyor...' : 'Emisyon Hesapla'}
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
                  {/* Total Emissions */}
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
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Toplam Emisyon</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.total_emissions.toFixed(6)} kg CO₂
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Average Emissions */}
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
                        <span style={{ color: '#2563eb', fontSize: '20px' }}>📊</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Ortalama Emisyon</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.avg_emissions.toFixed(6)} kg CO₂
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Execution Time */}
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
                        <span style={{ color: '#9333ea', fontSize: '20px' }}>⏱️</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Toplam Süre</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.total_execution_time.toFixed(2)} saniye
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Success Rate */}
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
                        <span style={{ color: '#16a34a', fontSize: '20px' }}>✅</span>
                      </div>
                      <div>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Başarı Oranı</p>
                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.successful_runs}/{result.repeat} ({((result.successful_runs / result.repeat) * 100).toFixed(1)}%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Result Details */}
                {result.last_result && (
                  <div style={{
                    marginTop: '24px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #dcfce7'
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#166534',
                      marginBottom: '16px'
                    }}>
                      Son Çalıştırma Detayları
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px'
                    }}>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Durum</p>
                        <p style={{ 
                          fontSize: '14px', 
                          fontWeight: 'bold',
                          color: result.last_result.success ? '#16a34a' : '#dc2626'
                        }}>
                          {result.last_result.success ? 'Başarılı' : 'Başarısız'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Çalışma Süresi</p>
                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.last_result.execution_time.toFixed(2)} saniye
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Emisyon</p>
                        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#1f2937' }}>
                          {result.last_result.emissions.toFixed(6)} kg CO₂
                        </p>
                      </div>
                    </div>
                    
                    {/* Output */}
                    {result.last_result.stdout && (
                      <div style={{ marginTop: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Çıktı:</p>
                        <pre style={{
                          backgroundColor: '#f3f4f6',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#374151',
                          overflow: 'auto',
                          maxHeight: '100px'
                        }}>
                          {result.last_result.stdout}
                        </pre>
                      </div>
                    )}
                    
                    {/* Error */}
                    {result.last_result.stderr && (
                      <div style={{ marginTop: '16px' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Hata:</p>
                        <pre style={{
                          backgroundColor: '#fef2f2',
                          padding: '12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#dc2626',
                          overflow: 'auto',
                          maxHeight: '100px'
                        }}>
                          {result.last_result.stderr}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          // Execution History View
          <ExecutionHistory />
        )}
      </div>
    </div>
  );
}

export default CodeCarbonTracker;