import { motion } from "framer-motion";
import { useState } from "react";
import { boardHouses, START_COORD } from "../data/board";
import { useGameStore } from "../store/gameStore";
import { characters } from "../data/characters";

export const BoardView = () => {
  const players = useGameStore((s) => s.players);
  const [movingIds, setMovingIds] = useState<Record<string, boolean>>({});
  const pawnContainerClassName = "h-10 w-9 overflow-hidden rounded-full border border-black bg-white ring-1 ring-black grid place-items-center opacity-100";
  const pawnScale = 1.9;
  const pawnOffsetY = 5;
  const pawnImageStyle = { transform: `translateY(${pawnOffsetY}px) scale(${pawnScale})` } as const;
  const pawnOffsetX = -18;
  const pawnOffsetYBoard = -18;

  const findCoord = (position: number) => {
    if (position <= 0) return START_COORD;
    return boardHouses.find((h) => h.index === position) ?? START_COORD;
  };

  return (
    <div className="relative h-full rounded-2xl border border-white/60 bg-white/40 shadow-xl">
      <img src="/img/tabuleiro/tabuleiro corrigido.png" alt="Tabuleiro" className="h-full w-full object-contain" />

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${START_COORD.x}%`, top: `${START_COORD.y}%` }}>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[10px] font-bold">INI</div>
        </div>

        {players.map((p) => {
          const ch = characters.find((c) => c.id === p.characterId);
          const coord = findCoord(p.position);
          const targetOpacity = 0.6;
          const displayOpacity = movingIds[p.id] ? 1 : targetOpacity;

          return (
            <motion.div
              key={p.id}
              initial={false}
              animate={{
                left: `${coord.x}%`,
                top: `${coord.y}%`,
                x: [pawnOffsetX, pawnOffsetX],
                y: [pawnOffsetYBoard - 12, pawnOffsetYBoard]
              }}
              transition={{
                duration: 0.9,
                ease: "easeOut",
                times: [0, 0.82, 1]
              }}
              onAnimationStart={() => setMovingIds((prev) => ({ ...prev, [p.id]: true }))}
              onAnimationComplete={() => setMovingIds((prev) => ({ ...prev, [p.id]: false }))}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: displayOpacity }}
            >
              <div className={pawnContainerClassName}>
                <img src={ch?.image} alt={p.name} className="h-full w-full object-contain" style={pawnImageStyle} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
