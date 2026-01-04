
export enum ExerciseType {
  // Fluency
  PHONEMIC = 'PHONEMIC',
  SEMANTIC = 'SEMANTIC',
  CHAIN_ASSOCIATION = 'CHAIN_ASSOCIATION',
  SPIDER_ASSOCIATION = 'SPIDER_ASSOCIATION',
  PERIPHRASIS = 'PERIPHRASIS',
  FLASH_DESCRIPTION = 'FLASH_DESCRIPTION',
  SYNONYMS = 'SYNONYMS',
  SHADOWING = 'SHADOWING',
  // Mnemonics
  MNEMONIC_NUMBERS_LEARN = 'MNEMONIC_NUMBERS_LEARN',
  MNEMONIC_NUMBERS_PINGPONG = 'MNEMONIC_NUMBERS_PINGPONG',
  MNEMONIC_NUMBERS_TARGHE = 'MNEMONIC_NUMBERS_TARGHE',
  MNEMONIC_LOCI = 'MNEMONIC_LOCI',
  MNEMONIC_NAMES = 'MNEMONIC_NAMES'
}

export type ModuleType = 'FLUENCY' | 'MNEMONICS';

export interface ExerciseResult {
  id: string;
  type: ExerciseType;
  date: Date;
  score: number;
  xpEarned: number;
  details: string;
  transcript?: string;
  validWords?: string[];
  invalidWords?: string[];
}

export interface ExerciseConfig {
  id: ExerciseType;
  title: string;
  description: string;
  icon: string;
  defaultTime: number;
  minLevel?: number;
  theory?: string; // Rich text or specific explanation for Mnemonics
}

export interface UserStats {
  xp: number;
  level: number;
  sessionsCount: number;
  bestScore: number;
  categoryMastery: Record<ExerciseType, number>;
}
