/**
 * CodeEditor Bileşeni
 * =================================================================
 * CodeMirror tabanlı kod editörü bileşeni. Farklı programlama
 * dilleri için syntax highlighting, otomatik tamamlama ve tema desteği sağlar.
 */

import { useEffect, useState, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { EditorView } from "@codemirror/view";
import "./CodeEditor.scss";

/**
 * @param {string} language - Programlama dili (python, javascript, java, cpp, c)
 * @param {string} code - Editörde gösterilecek kod
 * @param {Function} onCodeChange - Kod değiştiğinde çağrılacak callback
 * @param {string} height - Editör yüksekliği
 */
function CodeEditor({ language, code, onCodeChange, height = "400px" }) {
  // Her dil için son yazılan kodu sakla
  // Bu sayede dil değiştirildiğinde önceki kodlar kaybolmaz
  const [savedCodes, setSavedCodes] = useState({
    python: null,
    javascript: null,
    java: null,
    cpp: null,
    c: null,
  });

  // Örnek kodlar
  // useMemo ile gereksiz yeniden oluşturmayı önlüyoruz
  const examples = useMemo(
    () => ({
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

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        std::cout << "Fibonacci(" << i << ") = " << fibonacci(i) << std::endl;
    }
    return 0;
}`,
      c: `// C example code
#include <stdio.h>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n-1) + fibonacci(n-2);
}

int main() {
    for (int i = 0; i < 10; i++) {
        printf("Fibonacci(%d) = %d\\n", i, fibonacci(i));
    }
    return 0;
}`,
    }),
    []
  );

  // Dil değişince kaydedilmiş kodu ya da örnek kodu yukarıya geçir
  useEffect(() => {
    const saved = savedCodes[language];
    const next = saved !== null ? saved : examples[language] || "";
    onCodeChange(next);
  }, [language]);

  // Dil için uygun CodeMirror extension'ını döndürür
  const getLanguageExtension = (lang) => {
    switch (lang.toLowerCase()) {
      case "python":
        return python();
      case "javascript":
        return javascript();
      case "java":
        return java();
      case "cpp":
      case "c":
        return cpp(); // C için de C++ extension'ını kullanıyoruz
      default:
        return python(); // Varsayılan olarak Python
    }
  };

  // Editör teması
  const customTheme = useMemo(
    () =>
      EditorView.theme({
        "&": { color: "#374151", backgroundColor: "#ffffff" },
        ".cm-content": { caretColor: "#059669", fontFamily: "monospace" },
        ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#059669" },
        "&.cm-focused .cm-cursor": { borderLeftColor: "#059669" },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
          { backgroundColor: "#d1fae5" },
        ".cm-panels": { backgroundColor: "#f9fafb", color: "#374151" },
        ".cm-panels.cm-panels-top": { borderBottom: "1px solid #e5e7eb" },
        ".cm-panels.cm-panels-bottom": { borderTop: "1px solid #e5e7eb" },
        ".cm-searchMatch": { backgroundColor: "#fef3c7" },
        ".cm-searchMatch.cm-searchMatch-selected": {
          backgroundColor: "#f59e0b",
        },
        ".cm-activeLine": { backgroundColor: "#f0fdf4" },
        ".cm-selectionMatch": { backgroundColor: "#d1fae5" },
        "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
          {
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
        ".cm-foldGutter .cm-gutterElement": { color: "#6b7280" },
        ".cm-activeLineGutter .cm-foldGutter .cm-gutterElement": {
          color: "#059669",
        },
      }),
    []
  );

  return (
    <div>
      <CodeMirror
        className="code-editor"
        value={code}
        onChange={(val) => {
          onCodeChange(val);
          setSavedCodes((prev) => ({ ...prev, [language]: val })); // bu dil için kodu hatırla
        }}
        extensions={[getLanguageExtension(language), customTheme]}
        height={height}
        basicSetup={{
          lineNumbers: true, // Satır numaraları
          highlightActiveLineGutter: true, // Aktif satır gutter'ını vurgula
          highlightSpecialChars: true, // Özel karakterleri vurgula
          foldGutter: true, // Kod katlama gutter'ı
          drawSelection: true, // Seçimi çiz
          dropCursor: true, // Sürükle-bırak cursor'ı
          allowMultipleSelections: true, // Çoklu seçim
          indentOnInput: true, // Girişte otomatik girinti
          bracketMatching: true, // Parantez eşleştirme
          closeBrackets: true, // Otomatik parantez kapatma
          autocompletion: true, // Otomatik tamamlama
          rectangularSelection: true, // Dikdörtgen seçim
          crosshairCursor: true, // Crosshair cursor
          highlightActiveLine: true, // Aktif satırı vurgula
          highlightSelectionMatches: true, // Seçim eşleşmelerini vurgula
          closeBracketsKeymap: true, // Parantez kapatma kısayolları
          defaultKeymap: true, // Varsayılan kısayollar
          searchKeymap: true, // Arama kısayolları
          historyKeymap: true, // Geçmiş kısayolları
          foldKeymap: true, // Katlama kısayolları
          completionKeymap: true, // Tamamlama kısayolları
          lintKeymap: true, // Lint kısayolları
        }}
      />
    </div>
  );
}

export default CodeEditor;
