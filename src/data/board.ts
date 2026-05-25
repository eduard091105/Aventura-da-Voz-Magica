import type { BoardHouse, HouseType } from "../types/game";

const colorMap: Record<number, HouseType> = {
  3: "YELLOW",
  5: "RED",
  6: "GREEN",
  9: "YELLOW",
  11: "YELLOW",
  12: "RED",
  13: "YELLOW",
  16: "RED",
  18: "GREEN",
  19: "GREEN",
  20: "GREEN",
  21: "YELLOW",
  25: "RED",
  26: "YELLOW",
  29: "YELLOW",
  30: "GREEN",
  31: "YELLOW",
  32: "GREEN",
  33: "YELLOW"
};

export const BOARD_SIZE = 35;

export const HOUSE_RULES = {
  water: [2, 10, 23, 27],
  challengeGreenOrRed: [3, 9, 13, 21, 26, 29, 33],
  greenCard: [6, 18, 20, 30],
  backTwo: [5, 16],
  backOne: [12],
  advanceTwo: [19, 32],
  yellowCard: [11, 31],
  skipTurn: [25]
} as const;

export const START_COORD = { x: 8.2, y: 17.5 };

const houseCoords: Record<number, { x: number; y: number }> = {
  1: { x: 18.5, y: 16 },
  2: { x: 24.8, y: 16 },
  3: { x: 31, y: 16 },
  4: { x: 37.5, y: 23 },
  5: { x: 43.7, y: 23 },
  6: { x: 70.8, y: 17 },
  7: { x: 76, y: 16 },
  8: { x: 83.2, y: 16 },
  9: { x: 89.5, y: 16 },
  10: { x: 95.6, y: 16 },
  11: { x: 95.6, y: 28 },
  12: { x: 93.6, y: 41.5 },
  13: { x: 94.6, y: 54.5 },
  14: { x: 95.6, y: 65.5 },
  15: { x: 95.6, y: 75.8 },
  16: { x: 69.5, y: 54.5 },
  17: { x: 81.2, y: 35.5 },
  18: { x: 74, y: 36.5 },
  19: { x: 62.4, y: 35.6 },
  20: { x: 50, y: 35.6 },
  21: { x: 42, y: 35.6 },
  22: { x: 33.8, y: 35.6 },
  23: { x: 27.6, y: 35.6 },
  24: { x: 18.3, y: 35.6 },
  25: { x: 13.5, y: 45 },
  26: { x: 13.5, y: 56 },
  27: { x: 13.5, y: 68.4 },
  28: { x: 21.5, y: 72.4 },
  29: { x: 28.7, y: 72.4 },
  30: { x: 36.9, y: 72.4 },
  31: { x: 43.1, y: 72.4 },
  32: { x: 56.3, y: 72.4 },
  33: { x: 67.8, y: 72.4 },
  34: { x: 75, y: 72.4 },
  35: { x: 87.2, y: 89.4 }
};

export const boardHouses: BoardHouse[] = Array.from({ length: BOARD_SIZE }, (_, idx) => {
  const index = idx + 1;
  const type = index === BOARD_SIZE ? "FINISH" : colorMap[index] ?? "NORMAL";
  const coord = houseCoords[index];
  return { index, type, x: coord.x, y: coord.y };
});
