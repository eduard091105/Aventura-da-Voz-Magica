import { motion } from "framer-motion";
import { useState } from "react";
import { boardHouses, START_COORD } from "../data/board";
import { useGameStore } from "../store/gameStore";
import { characters } from "../data/characters";

export const BoardView = () => {
  const players = useGameStore((s) => s.players);
  const [movingIds, setMovingIds] = useState<Record<string, boolean>>({});
  // Ajuste visual simples do peao (em px) sem afetar a logica.
  const pawnWidthPx = 60;
  const pawnHeightPx = 60;
  const pawnScale = 1.9;
  const pawnOffsetY = 5;
  const pawnImageStyle = { transform: `translateY(${pawnOffsetY}px) scale(${pawnScale})` } as const;
  const pawnOffsetX = -32;
  const pawnOffsetYBoard = -18;

  const findCoord = (position: number) => {
    if (position <= 0) return START_COORD;
    return boardHouses.find((h) => h.index === position) ?? START_COORD;
  };

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-xl">
      {/* Ajuste aqui o TAMANHO da area do tabuleiro (h-full, max-w, etc.) */}
      {/* Ajuste aqui o ENCAIXE da imagem do tabuleiro: object-contain (mostra tudo) / object-cover (preenche cortando) */}
      <img
        src="/img/tabuleiro/tabuleiro corrigido certo.png"
        alt="Tabuleiro"
        className="absolute inset-0 h-full w-full object-fill"
      />

      <div className="pointer-events-none absolute inset-0">
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
              <div
                className="grid place-items-center overflow-hidden rounded-full border border-black bg-white ring-1 ring-black opacity-100"
                style={{ width: `${pawnWidthPx}px`, height: `${pawnHeightPx}px` }}
              >
                <img src={ch?.image} alt={p.name} className="h-full w-full object-contain" style={pawnImageStyle} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
