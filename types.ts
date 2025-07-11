
export enum VoteKind {
  MATCH_PREDICTION = '경기 스코어 예측',
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

export interface UserScorePrediction {
  id: string;
  vote_id: string;
  user_id: string;
  score_a: number;
  score_b: number;
  created_at?: string;
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
  userScorePrediction?: { scoreA: number, scoreB: number };
  scorePredictions?: UserScorePrediction[];
  players?: Player[];
  user_id?: string;
  match_id?: string;
}

export interface Match {
  id: string;
  created_at: string;
  competition: string;
  home_team: string;
  away_team: string;
  match_time: string;
  home_score: number | null;
  away_score: number | null;
  is_finished: boolean;
  user_id: string;
}

// New Article Type
export interface Article {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  imageUrl?: string;
  recommendations: number;
  views: number;
  userRecommended?: boolean;
  user_id?: string;
}

// New XPost Type
export interface XPost {
  id: string;
  createdAt: string;
  description: string;
  postUrl: string;
  user_id?: string;
}

// New Squad Types
export enum PlayerPosition {
  GK = '골키퍼',
  DF = '수비수',
  MF = '미드필더',
  FW = '공격수',
}

export interface SquadPlayer {
  id: string;
  createdAt: string;
  name: string;
  number: number;
  position: PlayerPosition;
  photoUrl?: string;
}

// New Auth Types
export interface Profile {
  id: string;
  updated_at?: string;
  username: string;
  nickname: string;
}
