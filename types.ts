export interface PlantCare {
  water: string;
  sun: string;
  soil: string;
  temperature: string;
  fertilizer: string;
}

export interface PlantData {
  name: string;
  scientificName: string;
  description: string;
  care: PlantCare;
  funFact: string;
  problems: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}