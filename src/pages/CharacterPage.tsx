import { ScreenShell } from "../components/ScreenShell";
import { characters } from "../data/characters";
import { useGameStore } from "../store/gameStore";

export const CharacterPage = () => {
  const players = useGameStore((s) => s.players);
  const selectCharacter = useGameStore((s) => s.selectCharacter);

  return (
    <ScreenShell className="bg-gradient-to-b from-grassKid to-skyKid">
      <h2 className="text-center text-3xl font-extrabold">Escolha de Personagem</h2>
      <div className="mx-auto mt-6 grid max-w-5xl gap-4">
        {players.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white/90 p-4">
            <p className="mb-3 text-lg font-bold">{p.name}</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => selectCharacter(p.id, c.id)}
                  className={`rounded-xl border-2 p-2 ${p.characterId === c.id ? "border-blue-600" : "border-transparent"}`}
                >
                  <img src={c.image} alt={c.name} className="mx-auto h-20 w-20 object-contain" />
                  <p className="text-sm font-semibold">{c.name}</p>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  );
};
