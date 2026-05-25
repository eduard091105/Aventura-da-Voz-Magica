import { ScreenShell } from "../components/ScreenShell";
import { useGameStore } from "../store/gameStore";
import { audio } from "../utils/audio";
import { useEffect } from "react";

export const VictoryPage = () => {
  const players = useGameStore((s) => s.players);
  const winnerId = useGameStore((s) => s.winnerId);
  const resetGame = useGameStore((s) => s.resetGame);
  const winner = players.find((p) => p.id === winnerId);

  useEffect(() => {
    audio.playWin();
  }, []);

  return (
    <ScreenShell className="grid place-items-center bg-gradient-to-br from-yellow-200 to-green-300">
      <section className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-2xl">
        <h2 className="text-4xl font-black">Parabens!</h2>
        <p className="mt-3 text-xl">{winner?.name} salvou a Voz Magica!</p>
        <button onClick={resetGame} className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-white">
          Jogar Novamente
        </button>
      </section>
    </ScreenShell>
  );
};
