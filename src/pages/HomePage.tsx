import { ScreenShell } from "../components/ScreenShell";
import { useGameStore } from "../store/gameStore";
import { useState } from "react";

export const HomePage = () => {
  const setupPlayers = useGameStore((s) => s.setupPlayers);
  const [names, setNames] = useState(["", ""]);

  const updateName = (index: number, value: string) => {
    const copy = [...names];
    copy[index] = value;
    setNames(copy);
  };

  const addPlayer = () => {
    if (names.length < 4) setNames([...names, ""]);
  };

  return (
    <ScreenShell className="flex items-center justify-center bg-gradient-to-br from-skyKid to-sunKid">
      <section className="w-full max-w-2xl rounded-3xl bg-white/90 p-6 shadow-xl">
        <h1 className="text-3xl font-extrabold">Aventura da Voz Magica</h1>
        <p className="mt-2 text-sm">Monte de 2 a 4 jogadores para comecar.</p>
        <div className="mt-5 grid gap-3">
          {names.map((name, idx) => (
            <input
              key={idx}
              value={name}
              onChange={(e) => updateName(idx, e.target.value)}
              placeholder={`Nome do Jogador ${idx + 1}`}
              className="h-12 rounded-xl border-2 border-slate-300 px-3 text-lg"
            />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={addPlayer} className="rounded-xl bg-slate-700 px-5 py-3 text-white" disabled={names.length >= 4}>
            Adicionar Jogador
          </button>
          <button
            onClick={() => setupPlayers(names.map((n, i) => (n.trim() ? n.trim() : `Jogador ${i + 1}`)))}
            className="rounded-xl bg-green-600 px-6 py-3 text-white"
          >
            Jogar
          </button>
        </div>
      </section>
    </ScreenShell>
  );
};
