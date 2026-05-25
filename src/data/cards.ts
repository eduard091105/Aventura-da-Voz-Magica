import type { Card } from "../types/game";

export const greenCards: Card[] = [
  { id: "g1", color: "GREEN", message: "Voce bebeu agua, avance 2 casas.", action: "ADVANCE", value: 2, image: "/img/cartas/cartas_verdes/descansou_a_voz.png" },
  { id: "g2", color: "GREEN", message: "Voce falou baixo, avance 1 casa.", action: "ADVANCE", value: 1, image: "/img/cartas/cartas_verdes/falou_baixo.png" },
  { id: "g3", color: "GREEN", message: "Respirou pelo nariz, avance 2 casas.", action: "ADVANCE", value: 2, image: "/img/cartas/cartas_verdes/respirou_pelo_nariz.png" },
  { id: "g4", color: "GREEN", message: "Descansou a voz, jogue novamente.", action: "PLAY_AGAIN", image: "/img/cartas/cartas_verdes/descansou_a_voz.png" },
  { id: "g5", color: "GREEN", message: "Falou sem gritar, avance 3 casas.", action: "ADVANCE", value: 3, image: "/img/cartas/cartas_verdes/falou_sem_gritar.png" }
];

export const redCards: Card[] = [
  { id: "r1", color: "RED", message: "Voce gritou, volte 2 casas.", action: "BACK", value: 2, image: "/img/cartas/cartas_vermelhas/voce_gritou.png" },
  { id: "r2", color: "RED", message: "Ficou pigarreando, perca 1 rodada.", action: "SKIP_TURN", image: "/img/cartas/cartas_vermelhas/ficou_pigarrado.png" },
  { id: "r3", color: "RED", message: "Falou muito alto, volte 3 casas.", action: "BACK", value: 3, image: "/img/cartas/cartas_vermelhas/falou_muito_alto.png" },
  { id: "r4", color: "RED", message: "Forcou a voz, volte 2 casas.", action: "BACK", value: 2, image: "/img/cartas/cartas_vermelhas/forçou_a_voz.png" }
];

export const yellowCards: Card[] = [
  { id: "y1", color: "YELLOW", message: "Faca uma respiracao pelo nariz agora.", action: "INTERACTION", image: "/img/cartas/cartas_amarelas/faça_uma_respiracao_pelo_nariz_agora.png" },
  { id: "y2", color: "YELLOW", message: "Imite alguem gritando e depois fale normal.", action: "INTERACTION", image: "/img/cartas/cartas_amarelas/imite_alguem_gritando_e_depois_fale_normal.png" },
  { id: "y3", color: "YELLOW", message: "Fale uma frase bem baixinho.", action: "INTERACTION", image: "/img/cartas/cartas_amarelas/fale_uma_frase_bem_baixinho.png" },
  { id: "y4", color: "YELLOW", message: "Finja beber agua.", action: "INTERACTION", image: "/img/cartas/cartas_amarelas/finja_beber_agua.png" }
];
