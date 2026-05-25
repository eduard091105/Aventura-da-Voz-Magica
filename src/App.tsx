import { useGameStore } from "./store/gameStore";
import { HomePage } from "./pages/HomePage";
import { SetupPage } from "./pages/SetupPage";
import { CharacterPage } from "./pages/CharacterPage";
import { BoardPage } from "./pages/BoardPage";
import { VictoryPage } from "./pages/VictoryPage";

const App = () => {
  const screen = useGameStore((s) => s.screen);

  let content = <HomePage />;
  if (screen === "SETUP") content = <SetupPage />;
  if (screen === "CHARACTERS") content = <CharacterPage />;
  if (screen === "BOARD") content = <BoardPage />;
  if (screen === "VICTORY") content = <VictoryPage />;

  return (
    <>
      {content}
      <footer className="pointer-events-none fixed bottom-1 left-1/2 z-[80] -translate-x-1/2 text-center text-[10px] font-medium text-black/70">
        Todos os direitos reservados Eduardo Cesar Goncalves 2026
      </footer>
    </>
  );
};

export default App;
