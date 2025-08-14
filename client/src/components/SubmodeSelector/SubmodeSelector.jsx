import './SubmodeSelector.scss';

function SubmodeSelector({ value, onChange, submodes = [] }) {
  return (
    <div className="submode-selector">
      <div className="submode-list">
      {submodes.map((mode) => {
            const isActive = mode.id === value.id;
            return (
              <button
                key={mode.id}
                type="button"
                className={`submode-btn ${isActive ? "active" : ""}`}
                onClick={() => onChange(mode)}
                aria-pressed={isActive}
              >
                {mode.label}
              </button>
            );
          })}
      </div>
    </div>
  );
}

export default SubmodeSelector;
