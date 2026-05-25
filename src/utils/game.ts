import type { Card } from "../types/game";

export const randomFrom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export const applyCardEffect = (position: number, max: number, card: Card) => {
  if (card.action === "ADVANCE") {
    return Math.min(position + (card.value ?? 0), max);
  }
  if (card.action === "BACK") {
    return Math.max(1, position - (card.value ?? 0));
  }
  return position;
};
