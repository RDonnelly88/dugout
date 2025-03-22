
import { PositionType } from './types';

// Formation positions for different team sizes
export const formationPositions: Record<string, PositionType[]> = {
  "5": [
    'goalkeeper',
    'defender-left',
    'defender-right',
    'midfielder-center-left',
    'forward-center'
  ],
  "6": [
    'goalkeeper',
    'defender-left',
    'defender-right',
    'midfielder-left',
    'midfielder-right',
    'forward-center'
  ],
  "7": [
    'goalkeeper',
    'defender-left',
    'defender-center-left',
    'defender-right',
    'midfielder-left',
    'midfielder-right',
    'forward-center'
  ],
  "11": [
    'goalkeeper',
    'defender-left',
    'defender-center-left',
    'defender-center-right',
    'defender-right',
    'midfielder-left',
    'midfielder-center-left',
    'midfielder-center-right',
    'midfielder-right',
    'forward-left',
    'forward-right'
  ]
};

// Line positions for displaying players in a simple row
export const linePositions: Record<string, PositionType[]> = {
  "5": Array(5).fill('line-player'),
  "6": Array(6).fill('line-player'),
  "7": Array(7).fill('line-player'),
  "11": Array(11).fill('line-player')
};
