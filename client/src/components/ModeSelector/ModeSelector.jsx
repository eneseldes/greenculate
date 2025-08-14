import { useRef, useEffect } from "react";
import AnimatedItem from "../AnimatedItem";
import "./ModeSelector.scss";

function ModeSelector({ value, onChange, modes = [] }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      const tabWidth = listRef.current.clientWidth / modes.length;
      listRef.current.style.setProperty("--tab-width", `${tabWidth}px`);
    }
  }, [modes.length]);

  return (
    <AnimatedItem
      delay={0.2}
      duration={1.4}
      y={-30}
      className="mode-selector"
      data-active-index={value.index}
      style={{ "--active-index": value.index }}
    >
      <div className="mode-selector-wrapper">
        <div className="mode-list" ref={listRef}>
          {modes.map((mode) => {
            const isActive = mode.id === value.id;
            return (
              <button
                key={mode.id}
                type="button"
                className={`mode-btn ${isActive ? "is-active" : ""}`}
                onClick={() => onChange(mode)}
                aria-pressed={isActive}
              >
                {mode.label}
              </button>
            );
          })}
          <div className="active-mode-indicator">
            <div className="filler"></div>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
}

export default ModeSelector;
