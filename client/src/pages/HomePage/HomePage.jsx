/**
 * HomePage Bileşeni
 * =================================================================
 * greenculate'in ana sayfası. Bu sayfadan TotalEmissionsSection'a ve
 * HTTPculate, Codeculate, JSONculate panellerine erişilebilir.
 */

import { useState } from "react";
import { RiArrowRightDoubleFill } from "react-icons/ri";
import ModeSelector from "../../components/ModeSelector/ModeSelector";
import SubmodeSelector from "../../components/SubmodeSelector/SubmodeSelector";
import HTTPculateExecute from "../../components/HTTPculate/HTTPculateExecute/HTTPculateExecute";
import HTTPculateHistory from "../../components/HTTPculate/HTTPculateHistory/HTTPculateHistory";
import CodeculateExecute from "../../components/Codeculate/CodeculateExecute/CodeculateExecute";
import CodeculateHistory from "../../components/Codeculate/CodeculateHistory/CodeculateHistory";
import JSONculateExecute from "../../components/JSONculate/JSONculateExecute/JSONculateExecute";
import JSONculateHistory from "../../components/JSONculate/JSONculateHistory/JSONculateHistory";
import TotalEmissionsPage from "../../components/TotalEmissionsSection/TotalEmissionsSection";
import AnimatedItem from "../../components/AnimatedItem";
import "./HomePage.scss";

function HomePage() {
  const modes = [
    {
      index: 0,
      id: "code",
      label: "💻 Codeculate",
    },
    {
      index: 1,
      id: "json",
      label: "📝 JSONculate",
    },
    {
      index: 2,
      id: "http",
      label: "🌐 HTTPculate",
    },
  ];
  const submodes = [
    { id: "execute", label: "🌐 İşlem Yap" },
    { id: "history", label: "📊 Geçmiş Kayıtlar" },
  ];

  // Submode'a göre gösterilecek bileşenler
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

  const [activeMode, setActiveMode] = useState(modes[0]);
  const [activeSubmode, setActiveSubmode] = useState(submodes[0]);
  const [inExecutionArea, setInExecutionArea] = useState(false);
  const [inTotalEmissions, setInTotalEmissions] = useState(false);

  return (
    <AnimatedItem
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      duration={0.8}
    >
      {/* Sayfanın üstündeki ana seçici */}
      <ModeSelector
        value={activeMode}
        onChange={(mode) => {
          setActiveMode(mode);
          setActiveSubmode(submodes[0]);
        }}
        modes={modes}
        show={inExecutionArea}
      />
      {/* Ana sayfa içeriği */}
      <main>
        {/* Sayfanın ortasında duran başlık */}
        {/* Execution veya TotalEmissions alanına göre başlığın dönüşümü */}
        <header
          className={`${inExecutionArea ? "in-execution-area" : ""} ${
            inTotalEmissions ? "in-total-emissions" : ""
          }`}
        >
          {/* Başlığa tıklanırsa Execution alanına geçiş yapılır */}
          {/* (TotalEmissions alanı aktif değilse) */}
          <h1
            className={`header-title`}
            onClick={() =>
              inTotalEmissions ? "" : setInExecutionArea(!inExecutionArea)
            }
          >
            greenculate
          </h1>
          <p className="header-subtitle">Karbon emisyonunu hesapla</p>
          {/* TotalEmissions alanına geçiş yapmak için tıklanabilir */}
          {/* Execution alanına girildiğinde görünmez olur */}
          <p
            className={`arrow ${inExecutionArea ? "hide" : ""} ${
              inTotalEmissions ? "rotate-180" : ""
            }`}
            onClick={() => setInTotalEmissions(!inTotalEmissions)}
          >
            <RiArrowRightDoubleFill />
          </p>
        </header>
        {/* Execution alanı, sırasıyla submode seçimi ve ilgili panel*/}
        <AnimatedItem
          className="mode-section"
          y={200}
          exit={{ y: 200, opacity: 0 }}
          show={inExecutionArea}
        >
          <SubmodeSelector
            value={activeSubmode}
            onChange={setActiveSubmode}
            submodes={submodes}
          />
          {activeMode.id === "http" && httpViews[activeSubmode.id]}
          {activeMode.id === "code" && codeViews[activeSubmode.id]}
          {activeMode.id === "json" && jsonViews[activeSubmode.id]}
        </AnimatedItem>
        {/* show ile gerektiği zaman gözükür (oka basıldığında) */}
        <TotalEmissionsPage show={inTotalEmissions} />
      </main>
    </AnimatedItem>
  );
}

export default HomePage;
