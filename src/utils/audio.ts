import { Howl } from "howler";

const safeHowl = (cfg: ConstructorParameters<typeof Howl>[0]) => {
  try {
    return new Howl(cfg);
  } catch {
    return null;
  }
};

const diceSound = safeHowl({ src: ["/sounds/dice.mp3"], volume: 0.5 });
const winSound = safeHowl({ src: ["/sounds/win.mp3"], volume: 0.6 });

export const audio = {
  playDice() {
    diceSound?.play();
  },
  playWin() {
    winSound?.play();
  }
};
