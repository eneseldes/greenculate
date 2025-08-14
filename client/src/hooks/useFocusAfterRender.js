import { useEffect, useRef } from "react";

/**
 * Belirli bir trigger değeri değiştiğinde ref'e scroll ve focus uygular.
 * @param {any} trigger - Tetikleyici değer (örn: result)
 * @param {number} focusDelay - Focus'un scroll sonrası kaç ms gecikmeyle verileceği
 * @param {ScrollIntoViewOptions} scrollOptions - scrollIntoView ayarları
 * @returns {React.RefObject} - DOM elementine verilecek ref
 */
// Tabindex vermeyi unutma

function useFocusAfterRender(
  trigger,
  focusDelay = 400,
  scrollOptions = { behavior: "smooth", block: "start" }
) {
  const elementRef = useRef(null);

  useEffect(() => {
    if (trigger && elementRef.current) {
      // Scroll
      elementRef.current.scrollIntoView(scrollOptions);

      // Focus (scroll animasyonunu bozmamak için gecikmeli)
      const timer = setTimeout(() => {
        if (elementRef.current) {
          elementRef.current.focus();
        }
      }, focusDelay);

      return () => clearTimeout(timer);
    }
  }, [trigger, focusDelay, scrollOptions]);

  return elementRef;
}

export default useFocusAfterRender;