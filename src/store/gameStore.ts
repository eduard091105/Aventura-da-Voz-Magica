import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOARD_SIZE } from "../data/board";
import { greenCards, redCards, yellowCards } from "../data/cards";
import { randomFrom, applyCardEffect } from "../utils/game";
import type { CardSource, Player, Screen, TurnResult } from "../types/game";

// Regras fixas do tabuleiro (fonte unica de verdade no runtime)
const waterHouses = new Set<number>([2, 10, 23, 27]);
const voiceCareHouses = new Set<number>([7, 14, 15, 24, 28, 34]);
const challengeHouses = new Set<number>([3, 9, 13, 21, 26, 29, 33]);
const greenCardHouses = new Set<number>([6, 18, 20, 30]);
const backTwoHouses = new Set<number>([5, 16]);
const backOneHouses = new Set<number>([12]);
const advanceTwoHouses = new Set<number>([19, 32]);
const yellowCardHouses = new Set<number>([11, 31]);
const skipTurnHouses = new Set<number>([25]);

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
  resolvePendingAdvance: () => void;
  devSetCurrentPlayer: (playerIndex: number) => void;
  devSetPlayerPosition: (playerId: string, position: number) => void;
  devSetPlayerSkipTurn: (playerId: string, skipTurn: boolean) => void;
  devClearTurnResult: () => void;
  nextTurn: () => void;
  resetGame: () => void;
  restartToSetup: () => void;
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
        let message = `${current.name} tirou ${rolled} (casa ${landedPos}).`;
        let extraTurn = false;
        let winner = false;
        let card;
        let cardSource: CardSource | undefined;
        let sideEvent: TurnResult["sideEvent"];
        let triggeredHouse: number | undefined;
        let pendingBackSteps: number | undefined;
        let pendingAdvanceSteps: number | undefined;

        // Regras por casa de pouso (SEM ambiguidade)
        if (waterHouses.has(landedPos)) {
          message = `${message} Beba água.`;
          sideEvent = { image: "/img/characters/gotinha_glu.png", text: "Beba água" };
          triggeredHouse = landedPos;
        } else if (voiceCareHouses.has(landedPos)) {
          message = `${message} Cuide do seu tom de voz.`;
          sideEvent = { image: "/img/characters/vozinha_vivi.png", text: "Cuide do seu tom de voz" };
          triggeredHouse = landedPos;
        } else if (yellowCardHouses.has(landedPos)) {
          card = randomFrom(yellowCards);
          cardSource = "YELLOW";
          message = `${message} Você caiu em casa de carta amarela.`;
        } else if (landedPos === 19) {
          pendingAdvanceSteps = 2;
          message = `${message} Beba água e avance 2 casas.`;
          sideEvent = { image: "/img/characters/gotinha_glu.png", text: "Beba água e avance 2 casas" };
          triggeredHouse = landedPos;
        } else if (landedPos === 32) {
          pendingAdvanceSteps = 2;
          message = `${message} Respire pelo nariz e avance 2 casas.`;
          sideEvent = { image: "/img/characters/narizinho_nina.png", text: "Respire pelo nariz e avance 2 casas" };
          triggeredHouse = landedPos;
        } else if (landedPos === 9 || challengeHouses.has(landedPos)) {
          // CASA DESAFIO (inclui explicitamente a 9): sempre verde OU vermelha.
          card = Math.random() < 0.5 ? randomFrom(greenCards) : randomFrom(redCards);
          cardSource = "CHALLENGE";
          const beforeCardPos = newPos;
          newPos = applyCardEffect(newPos, BOARD_SIZE, card);
          extraTurn = card.action === "PLAY_AGAIN";
          message = `${message} Você caiu em carta desafio.`;

          if (card.action === "BACK") {
            pendingBackSteps = Math.max(1, beforeCardPos - newPos);
            newPos = beforeCardPos;
          }
          if (card.action === "ADVANCE") {
            pendingAdvanceSteps = Math.max(1, newPos - beforeCardPos);
            newPos = beforeCardPos;
          }
          if (landedPos === 33 && card.action === "ADVANCE") {
            pendingAdvanceSteps = Math.max(1, BOARD_SIZE - beforeCardPos);
            newPos = beforeCardPos;
          }
        } else if (greenCardHouses.has(landedPos)) {
          card = randomFrom(greenCards);
          cardSource = "GREEN";
          newPos = applyCardEffect(newPos, BOARD_SIZE, card);
          extraTurn = card.action === "PLAY_AGAIN";
          message = `${message} Você caiu em casa de carta verde.`;
        } else if (landedPos === 5) {
          pendingBackSteps = 2;
          message = `${message} VOLTE 2 CASAS!`;
          sideEvent = { image: "/img/npcs/gritao.png", text: "VOLTE 2 CASAS!" };
          triggeredHouse = landedPos;
        } else if (backTwoHouses.has(landedPos)) {
          pendingBackSteps = 2;
          if (landedPos === 16) {
            message = `${message} Volte 2 casas.`;
            sideEvent = { image: "/img/characters/gritou.png", text: "Volte 2 casas" };
            triggeredHouse = landedPos;
          } else {
            message = `${message} Casa de punicao: volte 2 casas.`;
          }
        } else if (landedPos === 12) {
          pendingBackSteps = 1;
          message = `${message} Volte 1 casa.`;
          sideEvent = { image: "/img/npcs/geladao.png", text: "Volte 1 casa" };
          triggeredHouse = landedPos;
        } else if (skipTurnHouses.has(landedPos)) {
          message = `${message} Perca 1 rodada.`;
          sideEvent = { image: "/img/npcs/pigarro_pipo.png", text: "Perca 1 rodada" };
          triggeredHouse = landedPos;
        } else if (backOneHouses.has(landedPos)) {
          pendingBackSteps = 1;
          message = `${message} Casa de punicao: volte 1 casa.`;
        } else if (advanceTwoHouses.has(landedPos)) {
          // fallback defensivo (19 e 32 ja tratados acima)
          newPos = Math.min(BOARD_SIZE, newPos + 2);
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

        if (card?.action === "SKIP_TURN" || skipTurnHouses.has(landedPos)) {
          const updated = [...players];
          updated[currentPlayerIndex] = {
            ...current,
            position: newPos,
            skipTurn: true,
            winner
          };
          set({ players: updated, turnResult: { rolled, card, cardSource, sideEvent, triggeredHouse, pendingBackSteps, pendingAdvanceSteps, message, extraTurn: false, winner } });
          return rolled;
        }

        const updated = [...players];
        updated[currentPlayerIndex] = {
          ...current,
          position: (pendingBackSteps || pendingAdvanceSteps) ? landedPos : newPos,
          winner
        };

        set({
          players: updated,
          turnResult: { rolled, card, cardSource, sideEvent, triggeredHouse, pendingBackSteps, pendingAdvanceSteps, message, extraTurn, winner },
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
            card: undefined,
            cardSource: undefined,
            pendingBackSteps: undefined,
            sideEvent: undefined,
            triggeredHouse: undefined,
            message: `${current.name} voltou ${steps} ${steps === 1 ? "casa" : "casas"}.`
          }
        });
      },
      resolvePendingAdvance: () => {
        const { players, currentPlayerIndex, turnResult } = get();
        if (!players.length || !turnResult?.pendingAdvanceSteps) return;

        const current = players[currentPlayerIndex];
        const steps = turnResult.pendingAdvanceSteps;
        const newPos = Math.min(BOARD_SIZE, current.position + steps);
        const winner = newPos >= BOARD_SIZE;
        const updated = [...players];
        updated[currentPlayerIndex] = {
          ...current,
          position: newPos,
          winner
        };

        set({
          players: updated,
          turnResult: {
            ...turnResult,
            card: undefined,
            cardSource: undefined,
            pendingAdvanceSteps: undefined,
            sideEvent: undefined,
            triggeredHouse: undefined,
            winner,
            message: `${current.name} avançou ${steps} ${steps === 1 ? "casa" : "casas"}.`
          },
          winnerId: winner ? current.id : undefined,
          screen: winner ? "VICTORY" : "BOARD"
        });
      },
      devSetCurrentPlayer: (playerIndex) => {
        const { players } = get();
        if (!players.length) return;
        const safeIndex = Math.max(0, Math.min(playerIndex, players.length - 1));
        set({ currentPlayerIndex: safeIndex });
      },
      devSetPlayerPosition: (playerId, position) => {
        const { players } = get();
        const safePos = Math.max(0, Math.min(position, BOARD_SIZE));
        set({
          players: players.map((player) =>
            player.id === playerId ? { ...player, position: safePos, winner: safePos >= BOARD_SIZE } : player
          )
        });
      },
      devSetPlayerSkipTurn: (playerId, skipTurn) => {
        const { players } = get();
        set({
          players: players.map((player) => (player.id === playerId ? { ...player, skipTurn } : player))
        });
      },
      devClearTurnResult: () => {
        set({ turnResult: undefined });
      },
      nextTurn: () => {
        const { players, currentPlayerIndex } = get();
        if (!players.length) return;
        set({
          currentPlayerIndex: (currentPlayerIndex + 1) % players.length,
          turnResult: undefined
        });
      },
      resetGame: () => set({ screen: "HOME", players: [], currentPlayerIndex: 0, winnerId: undefined, turnResult: undefined }),
      restartToSetup: () => set({ screen: "SETUP", players: [], currentPlayerIndex: 0, winnerId: undefined, turnResult: undefined })
    }),
    {
      name: "voz-magica-save-v7",
      version: 5,
      // Sempre inicia do zero ao abrir/reiniciar.
      partialize: () => ({
        screen: "HOME",
        players: [] as Player[],
        currentPlayerIndex: 0,
        turnResult: undefined,
        winnerId: undefined
      }),
      migrate: () => ({
        screen: "HOME",
        players: [] as Player[],
        currentPlayerIndex: 0,
        turnResult: undefined,
        winnerId: undefined
      })
    }
  )
);
