import { ScreenShell } from "../components/ScreenShell";
import { useGameStore } from "../store/gameStore";
import { audio } from "../utils/audio";
import { useEffect } from "react";
import { motion } from "framer-motion";

export const VictoryPage = () => {
  const resetGame = useGameStore((s) => s.resetGame);
  const restartToSetup = useGameStore((s) => s.restartToSetup);

  useEffect(() => {
    audio.playWin();
  }, []);

  return (
    <ScreenShell className="p-0 md:p-0">
      <section className="fixed inset-0 overflow-hidden bg-[#f6d84f]">
        <div className="relative h-full w-full">
          <img
            src="/img/home/tela-vitoria.png"
            alt="Parabens"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute left-1/2 top-[88%] z-20 flex w-[52%] -translate-x-1/2 -translate-y-1/2 gap-3 md:gap-5">
            <motion.button
              type="button"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="h-14 flex-1 rounded-2xl border-2 border-white bg-blue-600 text-lg font-black text-white shadow-lg md:h-16 md:text-2xl"
            >
              Home
            </motion.button>
            <motion.button
              type="button"
              onClick={restartToSetup}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="h-14 flex-1 rounded-2xl border-2 border-white bg-pink-600 text-lg font-black text-white shadow-lg md:h-16 md:text-2xl"
            >
              Jogar Novamente
            </motion.button>
          </div>
        </div>
      </section>
    </ScreenShell>
  );
};
