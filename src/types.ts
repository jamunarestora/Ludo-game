
export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  id: number;
  color: PlayerColor;
  position: number; // -1: base, 0-51: common path, 52-56: home path, 57: home
  isHome: boolean;
  isBase: boolean;
}

export interface GameState {
  players: Record<PlayerColor, Piece[]>;
  activePlayers: PlayerColor[];
  currentPlayer: PlayerColor;
  diceValue: number | null;
  isRolling: boolean;
  gameStatus: 'SETUP' | 'PLAYING' | 'FINISHED';
  winners: PlayerColor[];
  canRoll: boolean;
  lastRollWasSix: boolean;
  previousState: GameState | null;
}
