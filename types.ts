
import { Session } from '@supabase/supabase-js';

export enum VoteKind {
  MATCH = '경기 결과 예측',
  PLAYER = '베스트 플레이어',
  TOPIC = '찬반 투표',
}

export interface VoteOption {
  id: string;
  label: string;
  votes: number;
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
  userVote?: string; // The id of the option the user voted for OR score string for match vote
  user_id?: string;
  teamA?: string; // For MATCH type
  teamB?: string; // For MATCH type
  finalScore?: string; // For MATCH type
  players?: Player[]; // For PLAYER type
}

// New type for individual user votes
export interface UserVote {
  vote_id: string;
  user_id: string;
  vote_value: string;
}

// New Player Rating Types (separated from Vote)
export interface PlayerRatingStat {
    playerId: number;
    playerName: string;
    averageRating: number;
    ratingCount: number;
    comments: string[];
}
export interface PlayerRating {
    id: string;
    createdAt: string;
    title: string;
    description?: string;
    imageUrl?: string;
    endDate: string;
    players: Player[];
    user_id?: string;
    stats?: PlayerRatingStat[];
    userSubmission?: PlayerRatingSubmission[]; // Holds the current user's submission
}
export interface PlayerRatingSubmission {
    id?: string;
    ratingId: string;
    userId: string;
    playerId: number;
    rating: number;
    comment: string | null;
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
  author?: {
    id: string;
    nickname: string;
  };
}

// New XPost Type
export interface XPost {
  id: string;
  createdAt: string;
  description: string;
  postUrl: string;
  user_id?: string;
  author?: {
    id: string;
    nickname: string;
  };
}

export type ArticleUpdateData = Omit<Article, 'id' | 'createdAt' | 'recommendations' | 'userRecommended' | 'views' | 'user_id' | 'author'>;
export type XPostUpdateData = Omit<XPost, 'id' | 'createdAt' | 'user_id' | 'author'>;


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

export type AuthSession = Session;