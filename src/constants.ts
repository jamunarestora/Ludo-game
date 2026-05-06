import { PlayerColor, Position } from './types';

export const BOARD_SIZE = 15;

export const PLAYER_COLORS: PlayerColor[] = ['RED', 'GREEN', 'YELLOW', 'BLUE'];

export const COLOR_CLASSES: Record<PlayerColor, string> = {
  RED: 'bg-red-500',
  GREEN: 'bg-green-500',
  YELLOW: 'bg-yellow-400',
  BLUE: 'bg-blue-600',
};

export const COLOR_BORDER_CLASSES: Record<PlayerColor, string> = {
  RED: 'border-red-700',
  GREEN: 'border-green-700',
  YELLOW: 'border-yellow-600',
  BLUE: 'border-blue-800',
};

// Common path coordinates in order for RED starting at (1, 6)
// The common path is 52 cells long.
// Indexes for each color's start:
export const START_INDEX: Record<PlayerColor, number> = {
  RED: 0,
  GREEN: 13,
  YELLOW: 26,
  BLUE: 39,
};

// Common path coordinates for 52 cells starting from RED's start (1, 6)
export const COMMON_PATH: Position[] = [
  // RED segment (Bottom left towards center-ish)
  { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
  { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
  { x: 7, y: 0 }, { x: 8, y: 0 },
  // GREEN segment
  { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
  { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
  { x: 14, y: 7 }, { x: 14, y: 8 },
  // YELLOW segment
  { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
  { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
  { x: 7, y: 14 }, { x: 6, y: 14 },
  // BLUE segment
  { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
  { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
  { x: 0, y: 7 }, { x: 0, y: 6 },
];

export const HOME_PATH: Record<PlayerColor, Position[]> = {
  RED: [
    { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
  ],
  GREEN: [
    { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 },
  ],
  YELLOW: [
    { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 },
  ],
  BLUE: [
    { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 },
  ],
};

export const HOME_POSITION: Record<PlayerColor, Position> = {
  RED: { x: 6, y: 7 },
  GREEN: { x: 7, y: 6 },
  YELLOW: { x: 8, y: 7 },
  BLUE: { x: 7, y: 8 },
};

export const BASE_POSITIONS: Record<PlayerColor, Position[]> = {
  RED: [
    { x: 1.5, y: 10.5 }, { x: 3.5, y: 10.5 },
    { x: 1.5, y: 12.5 }, { x: 3.5, y: 12.5 },
  ],
  GREEN: [
    { x: 1.5, y: 1.5 }, { x: 3.5, y: 1.5 },
    { x: 1.5, y: 3.5 }, { x: 3.5, y: 3.5 },
  ],
  YELLOW: [
    { x: 10.5, y: 1.5 }, { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 }, { x: 12.5, y: 3.5 },
  ],
  BLUE: [
    { x: 10.5, y: 10.5 }, { x: 12.5, y: 10.5 },
    { x: 10.5, y: 12.5 }, { x: 12.5, y: 12.5 },
  ],
};

export const SAFE_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];
