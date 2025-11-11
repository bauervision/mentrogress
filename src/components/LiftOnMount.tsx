"use client";
import { motion, AnimatePresence } from "framer-motion";

export default function LiftOnMount({
  children,
  delay = 0.02,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="lift"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.36, ease: [0.22, 0.8, 0.36, 1], delay }}
        style={{
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
