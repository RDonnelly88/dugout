
import { PositionType, FormationConfig } from './types';

// Formation configurations for different team sizes
export const formationConfigs: Record<string, FormationConfig> = {
  "5": { rows: [2, 2, 1], name: "2-2-1" },
  "6": { rows: [2, 2, 2], name: "2-2-2" },
  "7": { rows: [2, 3, 2], name: "2-3-2" },
  "8": { rows: [3, 3, 2], name: "3-3-2" },
  "9": { rows: [3, 4, 2], name: "3-4-2" },
  "10": { rows: [4, 4, 2], name: "4-4-2" },
  "11": { rows: [4, 4, 3], name: "4-4-3" }
};

// Line positions for displaying players in a simple row
export const linePositions: Record<string, PositionType[]> = {
  "5": Array(5).fill('line-player'),
  "6": Array(6).fill('line-player'),
  "7": Array(7).fill('line-player'),
  "8": Array(8).fill('line-player'),
  "9": Array(9).fill('line-player'),
  "10": Array(10).fill('line-player'),
  "11": Array(11).fill('line-player')
};
