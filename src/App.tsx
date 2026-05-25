import { useGameStore } from "./store/gameStore";
import { HomePage } from "./pages/HomePage";
import { CharacterPage } from "./pages/CharacterPage";
import { BoardPage } from "./pages/BoardPage";
import { VictoryPage } from "./pages/VictoryPage";

const App = () => {
  const screen = useGameStore((s) => s.screen);

  if (screen === "CHARACTERS") return <CharacterPage />;
  if (screen === "BOARD") return <BoardPage />;
  if (screen === "VICTORY") return <VictoryPage />;
  return <HomePage />;
};

export default App;
