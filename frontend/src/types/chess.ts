export type MoveJudgment =
  | 'BRILLIANT'
  | 'GREAT'
  | 'BEST'
  | 'EXCELLENT'
  | 'GOOD'
  | 'BOOK'
  | 'FORCED'
  | 'INACCURACY'
  | 'MISTAKE'
  | 'MISSED_WIN'
  | 'BLUNDER';

export interface MoveEvaluation {
  ply: number;
  moveNumber: number;
  playerColor: 'white' | 'black';
  san: string;
  uci: string;
  fromSquare?: string;
  toSquare?: string;
  isCheck?: boolean;
  isCapture?: boolean;
  fenBefore: string;
  fenAfter: string;
  evalScore: number | null;
  mateIn: number | null;
  evalText: string;
  bestMoveUci: string | null;
  bestMoveSan: string | null;
  bestEvalScore: number | null;
  bestMateIn: number | null;
  judgment: MoveJudgment;
  centipawnLoss: number;
  winChanceBefore: number;
  winChanceAfter: number;
  winChanceLoss: number;
  explanation: string;
}

export interface GameAnalysisReport {
  gameId?: string;
  url?: string;
  pgn: string;
  opening: string;
  timeClass?: string;
  result: string;
  whitePlayer: string;
  whiteRating?: number;
  blackPlayer: string;
  blackRating?: number;
  whiteAccuracy: number;
  blackAccuracy: number;

  // Complete breakdown
  whiteBrilliantMoves: number;
  blackBrilliantMoves: number;
  whiteGreatMoves: number;
  blackGreatMoves: number;
  whiteBestMoves: number;
  blackBestMoves: number;
  whiteExcellentMoves: number;
  blackExcellentMoves: number;
  whiteGoodMoves: number;
  blackGoodMoves: number;
  whiteBookMoves: number;
  blackBookMoves: number;
  whiteForcedMoves: number;
  blackForcedMoves: number;
  whiteInaccuracies: number;
  blackInaccuracies: number;
  whiteMistakes: number;
  blackMistakes: number;
  whiteMissedWins: number;
  blackMissedWins: number;
  whiteBlunders: number;
  blackBlunders: number;

  whiteAcpl: number;
  blackAcpl: number;
  moves: MoveEvaluation[];
}

export interface PlayerProfile {
  username: string;
  name?: string;
  avatar?: string;
  title?: string;
  url: string;
  country?: string;
  followers: number;
  stats?: {
    chess_rapid?: {
      last?: { rating: number };
      best?: { rating: number };
      record?: { win: number; loss: number; draw: number };
    };
    chess_blitz?: {
      last?: { rating: number };
      best?: { rating: number };
      record?: { win: number; loss: number; draw: number };
    };
    chess_bullet?: {
      last?: { rating: number };
      best?: { rating: number };
      record?: { win: number; loss: number; draw: number };
    };
  };
}

export interface PlayerSuggestion {
  username: string;
  name?: string;
  title?: string;
  avatar?: string;
  rating?: number;
}

export interface GameSummary {
  id: string;
  url: string;
  pgn: string;
  timeControl: string;
  timeClass: string;
  rated: boolean;
  whiteUsername: string;
  whiteRating?: number;
  whiteResult: string;
  blackUsername: string;
  blackRating?: number;
  blackResult: string;
  endTime: number;
  opening?: string;
  eco?: string;
}
