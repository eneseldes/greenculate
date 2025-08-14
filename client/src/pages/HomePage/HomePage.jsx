import { useState } from "react";
import ModeSelector from "../../components/ModeSelector/ModeSelector";
import SubmodeSelector from "../../components/SubmodeSelector/SubmodeSelector";
import HTTPculateExecute from "../../components/HTTPculate/HTTPculateExecute/HTTPculateExecute";
import HTTPculateHistory from "../../components/HTTPculate/HTTPculateHistory/HTTPculateHistory";
import CodeculateExecute from "../../components/Codeculate/CodeculateExecute/CodeculateExecute";
import CodeculateHistory from "../../components/Codeculate/CodeculateHistory/CodeculateHistory";
import JSONculateExecute from "../../components/JSONculate/JSONculateExecute/JSONculateExecute";
import JSONculateHistory from "../../components/JSONculate/JSONculateHistory/JSONculateHistory";
import "./HomePage.scss";
import AnimatedItem from "../../components/AnimatedItem";

function HomePage() {
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
    execute: <HTTPculateExecute />,
    history: <HTTPculateHistory />,
  };

  const codeViews = {
    execute: <CodeculateExecute />,
    history: <CodeculateHistory />,
  };

  const jsonViews = {
    execute: <JSONculateExecute />,
    history: <JSONculateHistory />,
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

      <AnimatedItem delay={0.6} duration={1.4} y={-20}>
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
      </AnimatedItem>
    </>
  );
}

export default HomePage;
