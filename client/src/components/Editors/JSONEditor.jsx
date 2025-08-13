import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json as jsonLang } from "@codemirror/lang-json";
import { EditorView } from "@codemirror/view";
import "./JSONEditor.scss";

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
  );
}

export default JSONEditor;
