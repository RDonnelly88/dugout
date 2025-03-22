
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
