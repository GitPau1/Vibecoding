
export enum VoteKind {
  MATCH = '경기 결과 예측',
  PLAYER = '베스트 플레이어',
  TOPIC = '찬반 투표',
  RATING = '선수 평점',
}

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
  ratingCount?: number;
  comments?: string[];
}

export interface Player {
    id: number;
    name: string;
    team: string;
    photoUrl?: string;
    isStarter?: boolean;
}

export interface Vote {
  id:string;
  title: string;
  type: VoteKind;
  description?: string;
  imageUrl?: string;
  options: VoteOption[];
  endDate: string;
  createdAt: string;
  userVote?: string; // The id of the option the user voted for
  userRatings?: { [key: number]: { rating: number; comment: string | null } };
  players?: Player[];
}

// New Quiz Types
export interface QuizQuestionOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizQuestionOption[];
  correctOptionId: number;
  imageUrl?: string;
}

export type NewQuizQuestion = Omit<QuizQuestion, 'id' | 'options'> & {
  options: Omit<QuizQuestionOption, 'id'>[];
};

export interface Quiz {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  questions: QuizQuestion[];
  createdAt: string;
}

// New Article Type
export interface Article {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  imageUrl?: string;
  recommendations: number;
  userRecommended?: boolean;
}