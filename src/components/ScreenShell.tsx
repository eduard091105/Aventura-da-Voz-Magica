import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

export const ScreenShell = ({ children, className }: Props) => (
  <motion.main
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className={`min-h-screen w-full p-4 md:p-6 ${className ?? ""}`}
  >
    {children}
  </motion.main>
);
