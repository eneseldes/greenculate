import { useState } from "react";
import ModeSelector from "./components/ModeSelector/ModeSelector";
import SubmodeSelector from "./components/SubmodeSelector/SubmodeSelector";
import HTTPRequestPanel from "./components/HTTPRequestSection/HTTPRequestPanel/HTTPRequestPanel";
import HTTPRequestHistory from "./components/HTTPRequestSection/HTTPRequestHistory/HTTPRequestHistory";
import CodeExecutionPanel from "./components/CodeExecutionSection/CodeExecutionPanel/CodeExecutionPanel";
import CodeExecutionHistory from "./components/CodeExecutionSection/CodeExecutionHistory/CodeExecutionHistory";
import JSONParsingPanel from "./components/JSONParsingSection/JSONParsingPanel/JSONParsingPanel";
import JSONParsingHistory from "./components/JSONParsingSection/JSONParsingHistory/JSONParsingHistory";
import "./App.scss";

function App() {
  const modes = [
    {
      index: 0,
      id: "http",
      label: "🌐 HTTPculate",
      description: "HTTP isteklerini yap ve sonucu gör",
    },
    {
      index: 1,
      id: "code",
      label: "💻 Codeculate",
      description: "Kod yaz ve sonucu gör",
    },
    {
      index: 2,
      id: "json",
      label: "📝 JSONculate",
      description: "JSON verilerini yap ve sonucu gör",
    },
  ];
  const submodes = [
    { id: "execute", label: "🌐 İşlem Yap" },
    { id: "history", label: "📊 Geçmiş Kayıtlar" },
  ];

  const [activeMode, setActiveMode] = useState(modes[0]);
  const [activeSubmode, setActiveSubmode] = useState(submodes[0]);

  const httpViews = {
    execute: <HTTPRequestPanel />,
    history: <HTTPRequestHistory />,
  };

  const codeViews = {
    execute: <CodeExecutionPanel />,
    history: <CodeExecutionHistory />,
  };

  const jsonViews = {
    execute: <JSONParsingPanel />,
    history: <JSONParsingHistory />,
  };

  return (
    <>
      <ModeSelector
        value={activeMode}
        onChange={(mode) => {
          setActiveMode(mode);
          setActiveSubmode(submodes[0]);
        }}
        modes={modes}
      />

      <main>
        <header>
          <h1 className="header-title">greenculate</h1>
          <p className="header-subtitle">Karbon emisyonunu hesapla</p>
        </header>

        <div className="mode-section">
          <div className="mode-description">{activeMode.description}</div>

          <SubmodeSelector
            value={activeSubmode}
            onChange={setActiveSubmode}
            submodes={submodes}
          />

          {activeMode.id === "http" && httpViews[activeSubmode.id]}
          {activeMode.id === "code" && codeViews[activeSubmode.id]}
          {activeMode.id === "json" && jsonViews[activeSubmode.id]}
        </div>
      </main>
    </>
  );
}

export default App;
