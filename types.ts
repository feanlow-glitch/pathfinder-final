
export enum RIASECCategory {
  R = 'Realistic',
  I = 'Investigative',
  A = 'Artistic',
  S = 'Social',
  E = 'Enterprising',
  C = 'Conventional'
}

export type CategoryKey = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface Question {
  id: number;
  text: string;
  category: CategoryKey;
}

export interface Career {
  title: string;
  description: string;
  primaryCodes: CategoryKey[];
  pathway: string;
}

export interface QuizResults {
  scores: Record<CategoryKey, number>;
  topThree: CategoryKey[];
  code: string;
}
