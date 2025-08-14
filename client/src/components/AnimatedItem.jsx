/**
 * AnimatedItem Bileşeni
 * =================================================================
 * Framer Motion kullanarak animasyonlu geçişler sağlayan wrapper bileşeni.
 * Diğer bileşenleri sarmalayarak fade-in ve slide animasyonları ekler.
 */

import { motion } from "framer-motion";

/**
 * AnimatedItem Bileşeni
 * @param {ReactNode} children - Animasyonlu olarak render edilecek içerik
 * @param {number} delay - Animasyon başlama gecikmesi (saniye, varsayılan: 0)
 * @param {number} duration - Animasyon süresi (saniye, varsayılan: 0.6)
 * @param {number} y - Başlangıç Y pozisyonu (piksel, varsayılan: 0)
 * @param {Array} easing - Easing fonksiyonu (varsayılan: [0.4, 0, 0.2, 1])
 * @param {Object} props - Diğer tüm props'lar (className, style, vb.)
 */
function AnimatedItem({
  children,
  delay = 0,
  duration = 0.6,
  y = 0,
  easing = [0.4, 0, 0.2, 1],
  ...props
}) {
  return (
    <motion.div
      // Başlangıç durumu
      initial={{ opacity: 0, y: y }}
      
      // Animasyon sonu durumu
      animate={{ opacity: 1, y: 0 }}
      
      transition={{ 
        delay,
        duration,
        ease: easing
      }}
      
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedItem;
