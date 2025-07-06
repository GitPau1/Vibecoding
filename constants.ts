
import { Vote, VoteKind, Quiz, Player } from './types';

export const MOCK_PLAYERS: Player[] = [
  { id: 1, name: '손흥민', team: '토트넘 홋스퍼', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/91845-1697703357.jpg?lm=1', isStarter: true },
  { id: 2, name: '이강인', team: '파리 생제르맹', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/627195-1692284564.jpg?lm=1', isStarter: true },
  { id: 3, name: '김민재', team: '바이에른 뮌헨', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/503482-1692282362.jpg?lm=1', isStarter: true },
  { id: 4, name: '황희찬', team: '울버햄튼 원더러스', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/292246-1692283917.jpg?lm=1', isStarter: true },
  { id: 5, name: '이재성', team: '마인츠 05', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/260243-1692283737.jpg?lm=1', isStarter: true },
  { id: 6, name: '황인범', team: '레드스타 베오그라드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/365593-1694762391.jpg?lm=1', isStarter: true },
];

export const MOCK_VOTES: Vote[] = [
  {
    id: 'mock-vote-1',
    title: '대한민국 vs 중국, 월드컵 예선 승리팀은?',
    type: VoteKind.MATCH,
    description: '2026 북중미 월드컵 아시아 2차 예선, 최종전의 승자를 예측해보세요.',
    imageUrl: 'https://i.ytimg.com/vi/j5f_O4-R3_8/maxresdefault.jpg',
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: 'mock-1-1', label: '대한민국 승', votes: 1200 },
      { id: 'mock-1-2', label: '무승부', votes: 150 },
      { id: 'mock-1-3', label: '중국 승', votes: 50 },
    ],
  },
  {
    id: 'mock-vote-2',
    title: '23/24 시즌 유럽파 최고의 선수는?',
    type: VoteKind.PLAYER,
    description: '이번 시즌 가장 뛰어난 활약을 펼친 유럽파 선수를 뽑아주세요.',
    imageUrl: 'https://i.namu.wiki/i/O6eB24dDzz9M4fIL2B5jX1P0UXS-g9b6p_OIV5sXqSl3Iq3qPqF_u1yEcUvjKn2c2_mF5xX45H-i_mI2eN_nJQ.webp',
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    players: MOCK_PLAYERS.slice(0, 4),
    options: MOCK_PLAYERS.slice(0, 4).map((p, i) => ({
      id: `mock-2-${i+1}`,
      label: p.name,
      votes: Math.floor(Math.random() * 500) + 50,
    })),
  },
  {
    id: 'mock-vote-3',
    title: '국가대표팀 클린스만 감독 경질, 찬성 vs 반대',
    type: VoteKind.TOPIC,
    description: '클린스만 감독의 경질에 대한 여러분의 생각은?',
    imageUrl: 'https://i.ytimg.com/vi/P1m_2nbiIqI/maxresdefault.jpg',
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    options: [
      { id: 'mock-3-1', label: '찬성', votes: 8500 },
      { id: 'mock-3-2', label: '반대', votes: 300 },
    ],
    userVote: 'mock-3-1',
  },
];

export const MOCK_RATINGS: Vote[] = [
  {
    id: 'mock-rating-1',
    title: '한국 vs 싱가포르 전 선수 평점',
    type: VoteKind.RATING,
    description: '2026 북중미 월드컵 2차 예선 5차전 선수들의 활약을 평가해주세요.',
    endDate: new Date().toISOString(),
    players: MOCK_PLAYERS,
    options: MOCK_PLAYERS.map(p => ({
        id: String(p.id),
        label: p.name,
        votes: Math.floor(Math.random() * 80) + 10,
        ratingCount: 10,
        comments: ['잘했어요', '아쉬웠어요'],
    })),
  }
];

export const MOCK_QUIZZES: Quiz[] = [
    {
        id: 'mock-quiz-1',
        title: 'K리그 수도권 팀 맞추기 퀴즈',
        description: '다음 중 K리그1의 수도권 연고 팀이 아닌 곳은 어디일까요?',
        imageUrl: 'https://www.kleague.com/assets/images/emblem/emblem_K1.png',
        questions: [
            {
                id: 'mock-q1',
                text: '다음 중 수도권 팀이 아닌 것을 고르세요.',
                options: [
                    { id: 'mock-q1-1', text: 'FC서울' },
                    { id: 'mock-q1-2', text: '수원FC' },
                    { id: 'mock-q1-3', text: '인천 유나이티드' },
                    { id: 'mock-q1-4', text: '대전 하나 시티즌' },
                ],
                correctOptionId: 4,
            }
        ]
    }
];
