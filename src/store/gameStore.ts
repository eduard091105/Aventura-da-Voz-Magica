import { create } from "zustand";
import { persist } from "zustand/middleware";
import { boardHouses, BOARD_SIZE, HOUSE_RULES } from "../data/board";
import { greenCards, redCards, yellowCards } from "../data/cards";
import { randomFrom, applyCardEffect } from "../utils/game";
import type { CardSource, Player, Screen, TurnResult } from "../types/game";

const waterHouses = new Set<number>(HOUSE_RULES.water);
const challengeHouses = new Set<number>(HOUSE_RULES.challengeGreenOrRed);
const greenCardHouses = new Set<number>(HOUSE_RULES.greenCard);
const backTwoHouses = new Set<number>(HOUSE_RULES.backTwo);
const backOneHouses = new Set<number>(HOUSE_RULES.backOne);
const yellowCardHouses = new Set<number>(HOUSE_RULES.yellowCard);
const skipTurnHouses = new Set<number>(HOUSE_RULES.skipTurn ?? []);
const voiceCareHouses = new Set<number>([7, 14, 15, 24, 28, 34]);

type GameState = {
  screen: Screen;
  players: Player[];
  currentPlayerIndex: number;
  turnResult?: TurnResult;
  winnerId?: string;
  setScreen: (screen: Screen) => void;
  setupPlayers: (names: string[]) => void;
  selectCharacter: (playerId: string, characterId: string) => void;
  rollDice: (forcedRoll?: number) => number | undefined;
  resolvePendingBack: () => void;
  nextTurn: () => void;
  resetGame: () => void;
};

const createPlayers = (names: string[]): Player[] =>
  names.map((name, idx) => ({
    id: `p${idx + 1}`,
    name,
    characterId: "",
    position: 0,
    skipTurn: false,
    winner: false
  }));

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: "HOME",
      players: [],
      currentPlayerIndex: 0,
      setScreen: (screen) => set({ screen }),
      setupPlayers: (names) => set({ players: createPlayers(names), screen: "CHARACTERS", currentPlayerIndex: 0 }),
      selectCharacter: (playerId, characterId) => {
        const players = get().players.map((p) => (p.id === playerId ? { ...p, characterId } : p));
        const allSelected = players.every((p) => p.characterId);
        set({ players, screen: allSelected ? "BOARD" : "CHARACTERS" });
      },
      rollDice: (forcedRoll) => {
        const { players, currentPlayerIndex } = get();
        if (!players.length) return undefined;
        const current = players[currentPlayerIndex];

        if (current.skipTurn) {
          const updated = [...players];
          updated[currentPlayerIndex] = { ...current, skipTurn: false };
          set({
            players: updated,
            turnResult: { rolled: 0, message: `${current.name} perdeu esta rodada.`, extraTurn: false, winner: false }
          });
          return 0;
        }

        const validForced = typeof forcedRoll === "number" && forcedRoll >= 1 && forcedRoll <= 6;
        const rolled = validForced ? Math.floor(forcedRoll) : Math.floor(Math.random() * 6) + 1;

        let newPos = Math.min(current.position + rolled, BOARD_SIZE);
        const landedPos = newPos;
        let message = `${current.name} tirou ${rolled}.`;
        let extraTurn = false;
        let winner = false;
        let card;
        let cardSource: CardSource | undefined;
        let sideEvent: TurnResult["sideEvent"];
        let pendingBackSteps: number | undefined;

        if (yellowCardHouses.has(newPos)) {
          card = randomFrom(yellowCards);
          cardSource = "YELLOW";
          message = `${message} Você caiu em casa de carta amarela.`;
        } else if (newPos === 19) {
          newPos = Math.min(BOARD_SIZE, newPos + 2);
          message = `${message} Beba água e avance 2 casas.`;
          sideEvent = { image: "/img/characters/gotinha_glu.png", text: "Beba água e avance 2 casas" };
        } else if (newPos === 32) {
          newPos = Math.min(BOARD_SIZE, newPos + 2);
          message = `${message} Respire pelo nariz e avance 2 casas.`;
          sideEvent = { image: "/img/characters/narizinho_nina.png", text: "Respire pelo nariz e avance 2 casas" };
        } else if (greenCardHouses.has(newPos)) {
          card = randomFrom(greenCards);
          cardSource = "GREEN";
          newPos = applyCardEffect(newPos, BOARD_SIZE, card);
          extraTurn = card.action === "PLAY_AGAIN";
          message = `${message} Você caiu em casa de carta verde.`;
        } else if (challengeHouses.has(newPos)) {
          card = Math.random() < 0.5 ? randomFrom(greenCards) : randomFrom(redCards);
          cardSource = "CHALLENGE";
          newPos = applyCardEffect(newPos, BOARD_SIZE, card);
          extraTurn = card.action === "PLAY_AGAIN";
          message = `${message} Você caiu em carta desafio.`;
        } else if (newPos === 5) {
          pendingBackSteps = 2;
          message = `${message} VOLTE 2 CASAS!`;
          sideEvent = { image: "/img/npcs/gritao.png", text: "VOLTE 2 CASAS!" };
        } else if (newPos === 16 || backTwoHouses.has(newPos)) {
          pendingBackSteps = 2;
          if (newPos === 16) {
            message = `${message} Volte 2 casas.`;
            sideEvent = { image: "/img/npcs/gritao.png", text: "Volte 2 casas" };
          } else {
            message = `${message} Casa de punicao: volte 2 casas.`;
          }
        } else if (newPos === 12) {
          pendingBackSteps = 1;
          message = `${message} Volte 1 casa.`;
          sideEvent = { image: "/img/npcs/geladao.png", text: "Volte 1 casa" };
        } else if (skipTurnHouses.has(newPos)) {
          message = `${message} Perca 1 rodada.`;
          sideEvent = { image: "/img/npcs/pigarro_pipo.png", text: "Perca 1 rodada" };
        } else if (backOneHouses.has(newPos)) {
          pendingBackSteps = 1;
          message = `${message} Casa de punicao: volte 1 casa.`;
        } else if (waterHouses.has(newPos)) {
          message = `${message} Beba água.`;
          sideEvent = { image: "/img/characters/gotinha_glu.png", text: "Beba água" };
        } else if (voiceCareHouses.has(newPos)) {
          message = `${message} Cuide do seu tom de voz.`;
          sideEvent = { image: "/img/characters/vozinha_vivi.png", text: "Cuide do seu tom de voz" };
        }

        // Safety net: any PLAY_AGAIN card keeps the same player turn.
        if (card?.action === "PLAY_AGAIN") {
          extraTurn = true;
        }

        if (newPos >= BOARD_SIZE) {
          newPos = BOARD_SIZE;
          winner = true;
          message = `${current.name} chegou ao final. Parabens!`;
        }

        if (card?.action === "SKIP_TURN" || skipTurnHouses.has(newPos)) {
          const updated = [...players];
          updated[currentPlayerIndex] = {
            ...current,
            position: newPos,
            skipTurn: true,
            winner
          };
          set({ players: updated, turnResult: { rolled, card, cardSource, sideEvent, pendingBackSteps, message, extraTurn: false, winner } });
          return rolled;
        }

        const updated = [...players];
        updated[currentPlayerIndex] = {
          ...current,
          position: pendingBackSteps ? landedPos : newPos,
          winner
        };

        set({
          players: updated,
          turnResult: { rolled, card, cardSource, sideEvent, pendingBackSteps, message, extraTurn, winner },
          winnerId: winner ? current.id : undefined,
          screen: winner ? "VICTORY" : "BOARD"
        });

        return rolled;
      },
      resolvePendingBack: () => {
        const { players, currentPlayerIndex, turnResult } = get();
        if (!players.length || !turnResult?.pendingBackSteps) return;

        const current = players[currentPlayerIndex];
        const steps = turnResult.pendingBackSteps;
        const newPos = Math.max(1, current.position - steps);
        const updated = [...players];
        updated[currentPlayerIndex] = {
          ...current,
          position: newPos
        };

        set({
          players: updated,
          turnResult: {
            ...turnResult,
            pendingBackSteps: undefined,
            sideEvent: undefined,
            message: `${current.name} voltou ${steps} ${steps === 1 ? "casa" : "casas"}.`
          }
        });
      },
      nextTurn: () => {
        const { players, currentPlayerIndex } = get();
        if (!players.length) return;
        set({
          currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
          turnResult: undefined
        });
      },
      resetGame: () => set({ screen: "HOME", players: [], currentPlayerIndex: 0, winnerId: undefined, turnResult: undefined })
    }),
    {
      name: "voz-magica-save-v4",
      version: 2,
      migrate: () => ({
        screen: "HOME",
        players: [],
        currentPlayerIndex: 0,
        turnResult: undefined,
        winnerId: undefined
      })
    }
  )
);
