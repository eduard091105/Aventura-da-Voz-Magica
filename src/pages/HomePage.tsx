import { ScreenShell } from "../components/ScreenShell";
import { useGameStore } from "../store/gameStore";
import { motion } from "framer-motion";

export const HomePage = () => {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <ScreenShell className="p-0 md:p-0">
      <section className="fixed inset-0 overflow-hidden bg-[#f6d84f]">
        <div className="relative h-full w-full">
          <img
            src="/img/home/tela-inicial.png"
            alt="Aventura da Voz Magica"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <motion.button
            type="button"
            onClick={() => setScreen("SETUP")}
            animate={{ y: [0, -5, 0], scale: [1, 1.05, 0.97], boxShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 0 8px rgba(255,255,255,0.9)", "0 0 0 rgba(255,255,255,0)"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.96 }}
            className="absolute left-[34.5%] top-[72.4%] z-20 h-[22%] w-[30%] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[999px] bg-transparent"
            aria-label="Jogar"
          >
            <span className="sr-only">Jogar</span>
          </motion.button>
        </div>
      </section>
    </ScreenShell>
  );
};
