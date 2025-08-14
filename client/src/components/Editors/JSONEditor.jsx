/**
 * JSONEditor Bileşeni
 * =================================================================
 * CodeMirror tabanlı JSON editörü bileşeni. JSON verilerini düzenlemek
 * için syntax highlighting, otomatik formatlama ve tema desteği sağlar.
 */

import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json as jsonLang } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import "./JSONEditor.scss";

/**
 * @param {string} value - Editörde gösterilecek JSON değeri
 * @param {Function} onChange - JSON değiştiğinde çağrılacak callback
 * @param {string} height - Editör yüksekliği
 */
function JSONEditor({ value, onChange, height = "400px"}) {
  // Editöre özel tema
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
        ".cm-searchMatch.cm-searchMatch-selected": { backgroundColor: "#f59e0b" },
        ".cm-activeLine": { backgroundColor: "#f0fdf4" },
        ".cm-selectionMatch": { backgroundColor: "#d1fae5" },
        "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
          color: "#059669",
          borderBottom: "1px solid #059669",
        },
        ".cm-gutters": { backgroundColor: "#f9fafb", color: "#6b7280", border: "none" },
        ".cm-activeLineGutter": { backgroundColor: "#f0fdf4", color: "#059669" },
        ".cm-foldGutter .cm-gutterElement": { color: "#6b7280" },
        ".cm-activeLineGutter .cm-foldGutter .cm-gutterElement": { color: "#059669" },
      }),
    []
  );

  return (
    <div>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[jsonLang(), customTheme]}
        height={height}
        className="json-editor"
        basicSetup={{
          lineNumbers: true,              // Satır numaraları
          highlightActiveLineGutter: true, // Aktif satır gutter'ını vurgula
          highlightSpecialChars: true,    // Özel karakterleri vurgula
          foldGutter: true,               // JSON katlama gutter'ı
          drawSelection: true,            // Seçimi çiz
          dropCursor: true,               // Sürükle-bırak cursor'ı
          allowMultipleSelections: true,  // Çoklu seçim
          indentOnInput: true,            // Girişte otomatik girinti
          bracketMatching: true,          // Parantez eşleştirme (JSON için önemli)
          closeBrackets: true,            // Otomatik parantez kapatma
          autocompletion: true,           // Otomatik tamamlama
          rectangularSelection: true,     // Dikdörtgen seçim
          crosshairCursor: true,          // Crosshair cursor
          highlightActiveLine: true,      // Aktif satırı vurgula
          highlightSelectionMatches: true, // Seçim eşleşmelerini vurgula
          closeBracketsKeymap: true,      // Parantez kapatma kısayolları
          defaultKeymap: true,            // Varsayılan kısayollar
          searchKeymap: true,             // Arama kısayolları
          historyKeymap: true,            // Geçmiş kısayolları
          foldKeymap: true,               // Katlama kısayolları
          completionKeymap: true,         // Tamamlama kısayolları
          lintKeymap: true,               // Lint kısayolları
        }}
      />
    </div>
  );
}

export default JSONEditor;
