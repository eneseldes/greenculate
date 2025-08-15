/**
 * ModeSelector Bileşeni
 * =================================================================
 * Uygulamada HTTPculate, Codeculate ve JSONculate modları arasında 
 * geçiş yapılmasını sağlayan yapı.
 */

import { useRef, useEffect } from "react";
import AnimatedItem from "../AnimatedItem";
import "./ModeSelector.scss";

/**
 * @param {Object} value - Aktif seçili mod bilgisi
 * @param {Function} onChange - Mod değiştiğinde çağrılacak callback fonksiyonu
 * @param {Array} modes - Kullanılabilir modların listesi (varsayılan: boş dizi)
 * @param {boolean} show - Mod seçici gösterilip gösterilmeyeceğini kontrol etmek için
 */
function ModeSelector({ value, onChange, modes = [], show = true }) {
  // mode-list genişliği hesaplamak için
  const listRef = useRef(null);

  useEffect(() => {
    // Tab genişliklerini hesaplayan ve dinamik değişken olarak ayarlayan fonksiyon
    // Kayma efekti için
    const calculateTabWidths = () => {
      if (listRef.current) {
        const tabWidth = listRef.current.clientWidth / modes.length;
        
        // Bu değer SCSS dosyasında kullanılacak, dinamik değişken
        listRef.current.style.setProperty("--tab-width", `${tabWidth}px`);
      }
    };

    // İlk yüklemede hesapla
    calculateTabWidths();

    // Window resize event listener ekle
    window.addEventListener('resize', calculateTabWidths);

    return () => {
      window.removeEventListener('resize', calculateTabWidths);
    };
  }, []);

  return (
    <AnimatedItem
      y={-30}
      exit={{ y: -100, opacity: 0 }}
      className="mode-selector"
      data-active-index={value.index}
      style={{ "--active-index": value.index }}  // Kayma efekti için dinamik variable
      show={show}
    >
      <div className="mode-selector-wrapper">
        <div className="mode-list" ref={listRef}>
          {/* Mode butonları */}
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
          
          {/* Aktif mod göstergesi - animasyonlu arka plan için */}
          <div className="active-mode-indicator">
            <div className="filler"></div>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
}

export default ModeSelector;
