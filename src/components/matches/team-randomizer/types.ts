
import { Player } from "@/types";

// Position types for formation display
export type PositionType = 
  | 'goalkeeper'
  | 'defender-left'
  | 'defender-center-left'
  | 'defender-center-right'
  | 'defender-right'
  | 'midfielder-left'
  | 'midfielder-center-left'
  | 'midfielder-center-right'
  | 'midfielder-right'
  | 'forward-left'
  | 'forward-center'
  | 'forward-right'
  | 'line-player'
  | 'formation-player'
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward';

// Formation configuration
export interface FormationConfig {
  rows: number[];
  name: string;
}

// Team data structure
export interface Team {
  name: string;
  players: Player[];
}
