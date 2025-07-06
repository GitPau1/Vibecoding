import { Vote, VoteKind, Quiz, Player, Article } from './types';

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
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
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
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
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
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
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

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'mock-article-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    title: '손흥민, 프리미어리그 100호골 달성! 아시아 선수 최초',
    body: '<h2>아시아 최초의 대기록</h2><p>토트넘 홋스퍼의 <strong>손흥민</strong>이 브라이튼과의 경기에서 대기록을 작성했습니다. 전반 10분, 페널티 에어리어 외곽에서 환상적인 오른발 감아차기 슛으로 골망을 흔들며 프리미어리그 통산 100번째 득점에 성공했습니다.</p><p>이는 아시아 선수로서는 최초의 기록으로, 그의 월드클래스 기량을 다시 한번 입증하는 순간이었습니다. 경기 후 손흥민은 "동료들과 팬들 덕분에 이룰 수 있었다"며 겸손한 소감을 밝혔습니다.</p>',
    imageUrl: 'https://img.sbs.co.kr/newsnet/etv/upload/2023/04/09/30000837190_1280.jpg',
    recommendations: 1024,
  },
  {
    id: 'mock-article-2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: '김민재, 뮌헨 이적 후 첫 공식전! "괴물 수비"는 여전했다',
    body: '<h3>성공적인 데뷔전</h3><p>바이에른 뮌헨으로 이적한 김민재가 라이프치히와의 슈퍼컵 경기에서 데뷔전을 치렀습니다. 비록 팀은 패배했지만, 김민재는 풀타임을 소화하며 분데스리가 최고의 공격수들을 상대로 인상적인 수비력을 선보였습니다.</p><p>특유의 빠른 발과 강력한 피지컬을 앞세워 상대 공격을 차단하는 모습은 팬들의 찬사를 받기에 충분했습니다. 앞으로의 활약이 더욱 기대됩니다.</p>',
    imageUrl: 'https://pds.joongang.co.kr/news/component/htmlphoto_mmdata/202307/19/d396486c-1349-4877-ab55-167822d569f6.jpg',
    recommendations: 768,
  }
];