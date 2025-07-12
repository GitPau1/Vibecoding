
import { Vote, VoteKind, Player, Article, XPost, SquadPlayer, PlayerPosition, PlayerRating } from './types';

export const MOCK_PLAYERS: Player[] = [
  { id: 1, name: '브루누 기마랑이스', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/659232-1675785723.jpg?lm=1', isStarter: true },
  { id: 2, name: '알렉산데르 이사크', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/349066-1698305273.jpg?lm=1', isStarter: true },
  { id: 3, name: '스벤 보트만', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/339193-1698305141.jpg?lm=1', isStarter: true },
  { id: 4, name: '키어런 트리피어', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/95992-1698305608.jpg?lm=1', isStarter: true },
  { id: 5, name: '조엘린통', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/348392-1698305417.jpg?lm=1', isStarter: true },
  { id: 6, name: '앤서니 고든', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/503733-1698305174.jpg?lm=1', isStarter: true },
  { id: 7, name: '산드로 토날리', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/397033-1688647575.jpg?lm=1', isStarter: true },
  { id: 8, name: '닉 포프', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/192931-1698305540.jpg?lm=1', isStarter: true },
  { id: 9, name: '파비안 셰어', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/135343-1698305576.jpg?lm=1', isStarter: true },
  { id: 10, name: '션 롱스태프', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/346700-1698305447.jpg?lm=1', isStarter: true },
  { id: 11, name: '칼럼 윌슨', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/158013-1698305634.jpg?lm=1', isStarter: true },
  { id: 12, name: '하비 반스', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/331320-1688648174.jpg?lm=1', isStarter: false },
  { id: 13, name: '조 윌록', team: '뉴캐슬 유나이티드', photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/340329-1698305658.jpg?lm=1', isStarter: false },
];

export const MOCK_SQUAD_PLAYERS: SquadPlayer[] = [
  { id: 'sq-8', createdAt: new Date().toISOString(), name: '닉 포프', number: 22, position: PlayerPosition.GK, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/192931-1698305540.jpg?lm=1' },
  { id: 'sq-3', createdAt: new Date().toISOString(), name: '스벤 보트만', number: 4, position: PlayerPosition.DF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/339193-1698305141.jpg?lm=1' },
  { id: 'sq-4', createdAt: new Date().toISOString(), name: '키어런 트리피어', number: 2, position: PlayerPosition.DF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/95992-1698305608.jpg?lm=1' },
  { id: 'sq-9', createdAt: new Date().toISOString(), name: '파비안 셰어', number: 5, position: PlayerPosition.DF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/135343-1698305576.jpg?lm=1' },
  { id: 'sq-1', createdAt: new Date().toISOString(), name: '브루누 기마랑이스', number: 39, position: PlayerPosition.MF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/659232-1675785723.jpg?lm=1' },
  { id: 'sq-5', createdAt: new Date().toISOString(), name: '조엘린통', number: 7, position: PlayerPosition.MF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/348392-1698305417.jpg?lm=1' },
  { id: 'sq-7', createdAt: new Date().toISOString(), name: '산드로 토날리', number: 8, position: PlayerPosition.MF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/397033-1688647575.jpg?lm=1' },
  { id: 'sq-10', createdAt: new Date().toISOString(), name: '션 롱스태프', number: 36, position: PlayerPosition.MF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/346700-1698305447.jpg?lm=1' },
  { id: 'sq-13', createdAt: new Date().toISOString(), name: '조 윌록', number: 28, position: PlayerPosition.MF, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/340329-1698305658.jpg?lm=1' },
  { id: 'sq-2', createdAt: new Date().toISOString(), name: '알렉산데르 이사크', number: 14, position: PlayerPosition.FW, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/349066-1698305273.jpg?lm=1' },
  { id: 'sq-6', createdAt: new Date().toISOString(), name: '앤서니 고든', number: 10, position: PlayerPosition.FW, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/503733-1698305174.jpg?lm=1' },
  { id: 'sq-11', createdAt: new Date().toISOString(), name: '칼럼 윌슨', number: 9, position: PlayerPosition.FW, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/158013-1698305634.jpg?lm=1' },
  { id: 'sq-12', createdAt: new Date().toISOString(), name: '하비 반스', number: 15, position: PlayerPosition.FW, photoUrl: 'https://img.a.transfermarkt.technology/portrait/header/331320-1688648174.jpg?lm=1' },
];

export const MOCK_VOTES: Vote[] = [
  {
    id: 'mock-vote-1',
    title: '뉴캐슬 vs 맨체스터 유나이티드, 스코어를 예측하세요!',
    type: VoteKind.MATCH,
    description: '세인트 제임스 파크에서 펼쳐지는 자존심 대결, 정확한 스코어를 맞춰보세요!',
    imageUrl: 'https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt5b6e41e31ce536a2/6389a46b53a5c20b8f9e6a06/GettyImages-1445749717.jpg',
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    teamA: '뉴캐슬',
    teamB: '맨체스터 유나이티드',
    options: [
      { id: 'mock-1-1', label: '2-1', votes: 850 },
      { id: 'mock-1-2', label: '1-0', votes: 420 },
      { id: 'mock-1-3', label: '1-1', votes: 350 },
      { id: 'mock-1-4', label: '2-0', votes: 310 },
      { id: 'mock-1-5', label: '3-1', votes: 250 },
    ],
  },
  {
    id: 'mock-vote-2',
    title: '뉴캐슬 이번 시즌 최고의 선수는?',
    type: VoteKind.PLAYER,
    description: '이번 시즌 뉴캐슬에서 가장 뛰어난 활약을 펼친 선수를 뽑아주세요.',
    imageUrl: 'https://cdn.newcastleutd.com/media/25130/all-players-celebrate-champions-league.jpg',
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    options: MOCK_PLAYERS.slice(0, 6).map((p, i) => ({
      id: `mock-2-${i+1}`,
      label: p.name,
      votes: Math.floor(Math.random() * 500) + 50,
    })),
  },
  {
    id: 'mock-vote-3',
    title: 'VAR(비디오 판독 시스템), 축구에 득인가 실인가?',
    type: VoteKind.TOPIC,
    description: '논란의 중심, VAR에 대한 팬 여러분의 생각을 투표해주세요.',
    imageUrl: 'https://img.olympicchannel.com/images/image/private/t_s_pog_16x9/f_auto/primary/bdlpbcy6wdqbf8vffzbs',
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Expired
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    options: [
      { id: 'mock-3-1', label: '득이다', votes: 4200 },
      { id: 'mock-3-2', label: '실이다', votes: 3800 },
    ],
    userVote: 'mock-3-1',
  },
];

export const MOCK_PLAYER_RATINGS: PlayerRating[] = [
  {
    id: 'mock-rating-1',
    title: '뉴캐슬 vs 아스날 전 선수 평점',
    description: '치열했던 빅매치! 뉴캐슬 선수들의 활약을 평가해주세요.',
    endDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    players: MOCK_PLAYERS,
    stats: MOCK_PLAYERS.map(p => ({
        playerId: p.id,
        playerName: p.name,
        averageRating: Math.random() * 4 + 5.5,
        ratingCount: Math.floor(Math.random() * 50) + 10,
        comments: ['최고의 활약!', '조금 아쉬웠어요', '다음엔 더 잘하길'],
    })),
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: 'mock-article-1',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    title: '브루누 기마랑이스: 뉴캐슬 중원의 심장',
    body: `<h2>세인트 제임스 파크의 지휘자</h2><p>브라질에서 온 마법사, <strong>브루누 기마랑이스</strong>는 뉴캐슬의 엔진 그 자체입니다. 그의 발끝에서 시작되는 날카로운 전진 패스, 지치지 않는 활동량, 그리고 상대의 공격을 끊어내는 영리한 수비까지, 그는 공수 양면에서 완벽한 모습을 보여주고 있습니다.</p><p>그가 있고 없고의 차이는 팀의 경기력에 직접적인 영향을 미칩니다. 팬들은 그를 '토탈 패키지'라 부르며, 그의 플레이 하나하나에 열광합니다. 과연 그는 뉴캐슬을 새로운 영광의 시대로 이끌 수 있을까요?</p>`,
    imageUrl: 'https://i2-prod.chroniclelive.co.uk/incoming/article28699741.ece/ALTERNATES/s1200c/0_GettyImages-2052445831.jpg',
    recommendations: 1152,
    views: 12345,
    user_id: 'mock-user-1',
    author: { id: 'mock-user-1', nickname: '축구광팬' },
  },
  {
    id: 'mock-article-2',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'The Entertainers: 키건의 전설적인 팀을 돌아보다',
    body: `<h3>90년대 낭만 축구의 아이콘</h3><p>케빈 키건 감독이 이끌던 1990년대 중반의 뉴캐슬은 '엔터테이너스(The Entertainers)'라는 별명으로 불렸습니다. 앨런 시어러, 레스 퍼디난드, 다비드 지놀라 등 화려한 공격진을 앞세운 그들의 축구는 팬들의 심장을 뛰게 했습니다.</p><p>비록 아쉽게 프리미어리그 우승컵을 들어 올리진 못했지만, 그들의 화끈한 공격 축구는 지금까지도 많은 팬들의 기억 속에 최고의 팀으로 남아있습니다. 그 시절의 낭만을 다시 한번 느껴봅니다.</p>`,
    imageUrl: 'https://cdn.themag.co.uk/wp-content/uploads/2022/01/27-Jan-1996-Middlesbrough-1-Newcastle-2.jpg',
    recommendations: 896,
    views: 9876,
    userRecommended: true,
    user_id: 'mock-user-2',
    author: { id: 'mock-user-2', nickname: '전술분석가' },
  }
];

export const MOCK_X_POSTS: XPost[] = [
  {
    id: 'mock-x-post-1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    description: '공식 발표: 뉴캐슬 유나이티드가 새로운 유망주 윙어와 5년 계약을 체결했습니다! 메디컬 테스트 완료 후 팀에 합류할 예정입니다.',
    postUrl: 'https://x.com/FabrizioRomano/status/1808039304997708182',
    user_id: 'mock-user-1',
    author: { id: 'mock-user-1', nickname: '축구광팬' },
  },
  {
    id: 'mock-x-post-2',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    description: '다음 주 챔피언스리그 경기를 앞두고 주장 키어런 트리피어가 훈련에 복귀했습니다. 팀에 큰 힘이 될 것입니다.',
    postUrl: 'https://x.com/NUFC/status/1810243171350024497',
    user_id: 'mock-user-2',
    author: { id: 'mock-user-2', nickname: '전술분석가' },
  }
];
