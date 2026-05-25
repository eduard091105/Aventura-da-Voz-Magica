export type HouseType = "NORMAL" | "GREEN" | "RED" | "YELLOW" | "FINISH";

export type CardActionType =
  | "ADVANCE"
  | "BACK"
  | "SKIP_TURN"
  | "PLAY_AGAIN"
  | "INTERACTION";

export type Character = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export type Player = {
  id: string;
  name: string;
  characterId: string;
  position: number;
  skipTurn: boolean;
  winner: boolean;
};

export type BoardHouse = {
  index: number;
  type: HouseType;
  x: number;
  y: number;
};

export type Card = {
  id: string;
  color: "GREEN" | "RED" | "YELLOW";
  message: string;
  action: CardActionType;
  value?: number;
  image?: string;
};

export type Screen = "HOME" | "CHARACTERS" | "BOARD" | "VICTORY";

export type CardSource = "YELLOW" | "GREEN" | "CHALLENGE";

export type TurnResult = {
  rolled: number;
  card?: Card;
  cardSource?: CardSource;
  sideEvent?: {
    image: string;
    text: string;
  };
  pendingBackSteps?: number;
  message: string;
  extraTurn: boolean;
  winner: boolean;
};
