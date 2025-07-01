import { Vote, VoteKind, Player, Quiz } from './types';

export const MOCK_PLAYERS: Player[] = [
    { id: 1, name: '손흥민', team: '토트넘 홋스퍼', photoUrl: 'https://picsum.photos/seed/son/200' },
    { id: 2, name: '이강인', team: '파리 생제르맹', photoUrl: 'https://picsum.photos/seed/lee/200' },
    { id: 3, name: '김민재', team: '바이에른 뮌헨', photoUrl: 'https://picsum.photos/seed/kim/200' },
    { id: 4, name: '황희찬', team: '울버햄튼 원더러스', photoUrl: 'https://picsum.photos/seed/hwang/200' },
    { id: 5, name: 'Lionel Messi', team: 'Inter Miami', photoUrl: 'https://picsum.photos/seed/messi/200' },
    { id: 6, name: 'Cristiano Ronaldo', team: 'Al Nassr', photoUrl: 'https://picsum.photos/seed/ronaldo/200' },
    { id: 7, name: 'Neymar Jr.', team: 'Al Hilal', photoUrl: 'https://picsum.photos/seed/neymar/200' },
    { id: 8, name: 'Kylian Mbappé', team: 'Real Madrid', photoUrl: 'https://picsum.photos/seed/mbappe/200' },
];

const futureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const pastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const RATING_PLAYERS: Player[] = [
    // Starters
    { id: 1, name: '손흥민', team: '토트넘 홋스퍼', photoUrl: 'https://picsum.photos/seed/son/200', isStarter: true },
    { id: 2, name: '이강인', team: '파리 생제르맹', photoUrl: 'https://picsum.photos/seed/lee/200', isStarter: true },
    { id: 3, name: '김민재', team: '바이에른 뮌헨', photoUrl: 'https://picsum.photos/seed/kim/200', isStarter: true },
    { id: 4, name: '황희찬', team: '울버햄튼 원더러스', photoUrl: 'https://picsum.photos/seed/hwang/200', isStarter: true },
    // Subs
    { id: 8, name: 'Kylian Mbappé', team: 'Real Madrid', photoUrl: 'https://picsum.photos/seed/mbappe/200', isStarter: false },
];

export const INITIAL_RATINGS: Vote[] = [
  {
    id: '6',
    title: '중국전 선수 평점을 매겨주세요!',
    type: VoteKind.RATING,
    description: '2026 월드컵 예선 중국과의 경기에서 선수들의 활약을 평가해주세요. 평점은 1점부터 10점까지 가능합니다.',
    players: RATING_PLAYERS,
    options: RATING_PLAYERS.map(p => ({
        id: p.id,
        label: p.name,
        // Mock data for ratings: votes is sum of ratings, ratingCount is number of raters
        votes: Math.floor(Math.random() * 200) + 700, // e.g. avg rating 7-9, 100 raters
        ratingCount: 100,
    })),
    endDate: pastDate(1), // Expired vote, so ratings can be given
  },
];

export const INITIAL_VOTES: Vote[] = [
  {
    id: '1',
    title: '대한민국 vs 이라크, 월드컵 예선 최종 승자는?',
    type: VoteKind.MATCH,
    description: '2026 FIFA 월드컵 아시아 최종 예선 B조의 빅매치! 여러분의 예상을 투표해주세요.',
    options: [
      { id: 1, label: '대한민국 승', votes: 120 },
      { id: 2, label: '무승부', votes: 30 },
      { id: 3, label: '이라크 승', votes: 15 },
    ],
    endDate: futureDate(5),
  },
  {
    id: '2',
    title: '이번 시즌 최고의 K-리거는 누구?',
    type: VoteKind.PLAYER,
    description: '유럽 무대를 빛내고 있는 자랑스러운 대한민국 선수 4인 중 최고의 선수를 뽑아주세요.',
    players: MOCK_PLAYERS.slice(0, 4),
    options: [
        { id: 1, label: MOCK_PLAYERS[0].name, votes: 250 },
        { id: 2, label: MOCK_PLAYERS[1].name, votes: 180 },
        { id: 3, label: MOCK_PLAYERS[2].name, votes: 150 },
        { id: 4, label: MOCK_PLAYERS[3].name, votes: 110 },
    ],
    endDate: futureDate(10),
    userVote: 1, // Example of a vote the user already made
  },
  {
    id: '3',
    title: 'VAR 판정, 이대로 괜찮은가?',
    type: VoteKind.TOPIC,
    description: '논란의 중심, VAR! 축구 경기에 긍정적인 영향을 주고 있다고 생각하십니까?',
    imageUrl: 'https://picsum.photos/seed/var/800/400',
    options: [
      { id: 1, label: '예', votes: 450 },
      { id: 2, label: '아니오', votes: 320 },
    ],
    endDate: futureDate(2),
  },
  {
    id: '4',
    title: '맨시티 vs 리버풀, 프리미어리그 개막전 승자는?',
    type: VoteKind.MATCH,
    description: '지난 시즌 챔피언과 준우승팀의 맞대결! 승점 3점을 가져갈 팀은?',
    options: [
      { id: 1, label: '맨체스터 시티 승', votes: 0 },
      { id: 2, label: '무승부', votes: 0 },
      { id: 3, label: '리버풀 승', votes: 0 },
    ],
    endDate: futureDate(20),
  },
  {
    id: '5',
    title: '차기 KFA 회장으로 외국인 선임, 어떻게 생각하세요?',
    type: VoteKind.TOPIC,
    description: '대한민국 축구의 미래를 위한 선택, 당신의 의견은?',
    options: [
      { id: 1, label: '찬성', votes: 98 },
      { id: 2, label: '반대', votes: 215 },
    ],
    endDate: pastDate(3), // Expired vote
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
    {
        id: 'q1',
        title: '축구 기본 규칙 퀴즈',
        description: '축구의 가장 기본적인 규칙들을 얼마나 알고 계신가요? 당신의 지식을 테스트해보세요!',
        imageUrl: 'https://picsum.photos/seed/quiz1/800/400',
        questions: [
            {
                id: 1,
                text: '한 팀의 경기 인원은 골키퍼를 포함하여 몇 명일까요?',
                options: [ {id: 1, text: '10명'}, {id: 2, text: '11명'}, {id: 3, text: '12명'} ],
                correctOptionId: 2,
            },
            {
                id: 2,
                text: '골키퍼를 제외한 선수가 손이나 팔로 공을 만졌을 때 주어지는 반칙은?',
                options: [ {id: 1, text: '오프사이드'}, {id: 2, text: '드로인'}, {id: 3, text: '핸드볼'} ],
                correctOptionId: 3,
            },
            {
                id: 3,
                text: 'FIFA 월드컵은 몇 년 주기로 개최될까요?',
                options: [ {id: 1, text: '2년'}, {id: 2, text: '3년'}, {id: 3, text: '4년'} ],
                correctOptionId: 3,
            }
        ]
    },
    {
        id: 'q2',
        title: '2002 월드컵 영웅 맞추기',
        description: '사진 속 주인공은 누구일까요? 2002년의 감동을 다시 한번 느껴보세요.',
        imageUrl: 'https://picsum.photos/seed/quiz2/800/400',
        questions: [
            {
                id: 1,
                text: '이탈리아와의 16강전에서 안정적인 수비와 극적인 동점골을 기록한 선수는?',
                imageUrl: 'https://picsum.photos/seed/player1/400/300',
                options: [ {id: 1, text: '홍명보'}, {id: 2, text: '설기현'}, {id: 3, text: '안정환'} ],
                correctOptionId: 2,
            },
            {
                id: 2,
                text: '스페인과의 8강전 승부차기에서 마지막 키커로 나서 승리를 확정지은 선수는?',
                imageUrl: 'https://picsum.photos/seed/player2/400/300',
                options: [ {id: 1, text: '홍명보'}, {id: 2, text: '박지성'}, {id: 3, 'text': '이운재'} ],
                correctOptionId: 1,
            }
        ]
    }
];