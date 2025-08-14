
/**
 * useFocusAfterRender Hook'u
 * =================================================================
 * Execute işlemi yapıldığında ekrana gelen result container'a focuslanma
 * hook'u.
 * ÖNEMLİ: Focuslanacak elementin tabindex'ine -1 verilmelidir.
 */

import { useEffect, useRef } from "react";

/**
 * @param {any} trigger - Tetikleyici değer (örn: result)
 * @param {number} focusDelay - Focus'un scroll sonrası kaç ms gecikmeyle verileceği
 * @param {ScrollIntoViewOptions} scrollOptions - scrollIntoView ayarları
 * @returns {React.RefObject} - DOM elementine verilecek ref
 */
function useFocusAfterRender(
  trigger,
  focusDelay = 400,
  scrollOptions = { behavior: "smooth", block: "start" }
) {
  // Odaklanılacak elementin ref'i
  const elementRef = useRef(null);

  // Smooth behavior eklendikten sonra focus eklenir
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