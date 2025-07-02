export type Card = {
  id: string;
  image: string;
  open: boolean;
};

export type Player = {
  id: number;
  name: string;
  avatar: string;
  cards: Card[];
  isUser: boolean;
};

export type GameStage = 1 | 2;

export type GameState = {
  players: Player[];
  stage: GameStage;
  currentPlayer: number;
  dropZoneActive: boolean;
}; 