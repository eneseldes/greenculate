import { motion } from "framer-motion";

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
      initial={{ opacity: 0, y: y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration, ease: easing }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedItem;
