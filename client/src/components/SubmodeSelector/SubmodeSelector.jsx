/**
 * SubmodeSelector Bileşeni
 * =================================================================
 * Her mod için alt modları (İşlem Yap / Geçmiş Kayıtlar) seçmek için 
 * kullanılan buton grubu bileşeni.
 */

import './SubmodeSelector.scss';

/**
 * @param {Object} value - Aktif seçili alt mod bilgisi
 * @param {Function} onChange - Alt mod değiştiğinde çağrılacak callback fonksiyonu
 * @param {Array} submodes - Kullanılabilir alt modların listesi
 */
function SubmodeSelector({ value, onChange, submodes = [] }) {
  return (
    <div className="submode-selector">
      <div className="submode-list">
        {/* Submode butonları */}
        {submodes.map((submode) => {
          const isActive = submode.id === value.id;
          return (
            <button
              key={submode.id}
              type="button"
              className={`submode-btn ${isActive ? "active" : ""}`} 
              onClick={() => onChange(submode)} 
              aria-pressed={isActive}
            >
              {submode.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SubmodeSelector;
