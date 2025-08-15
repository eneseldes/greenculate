/**
 * AnimatedItem Bileşeni
 * =================================================================
 * Framer Motion kullanarak animasyonlu geçişler sağlayan wrapper bileşeni.
 * AnimatePresence içeride kullanıldığı için giriş/çıkış animasyonları
 * ana sayfada ek bir sarmalayıcıya gerek kalmadan çalışır.
 */

import { motion, AnimatePresence } from "framer-motion";

function AnimatedItem({
  children,
  delay = 0,
  duration = 0.6,
  y = 100,
  easing = [0.4, 0, 0.2, 1],
  exit = { y: 100, opacity: 0 },
  show = true, // gösterilip gösterilmeyeceğini kontrol etmek için
  ...props
}) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="animated-item"
          initial={{ opacity: 0, y: y }}
          animate={{ opacity: 1, y: 0 }}
          exit={exit}
          transition={{
            delay,
            duration,
            ease: easing
          }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AnimatedItem;
