
import { Vote, VoteKind, Player, Quiz } from './types';

export const MOCK_PLAYERS: Player[] = [
    { id: 1, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/isak/200' },
    { id: 2, name: '브루노 기마랑이스', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/bruno/200' },
    { id: 3, name: '키어런 트리피어', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/trippier/200' },
    { id: 4, name: '앤서니 고든', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/gordon/200' },
    { id: 5, name: '스벤 보트만', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/botman/200' },
    { id: 6, name: '조엘린통', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/joelinton/200' },
    { id: 7, name: '미겔 알미론', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/almiron/200' },
    { id: 8, name: '칼럼 윌슨', team: '뉴캐슬 유나이티드', photoUrl: 'https://picsum.photos/seed/wilson/200' },
];

const futureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const pastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const RATING_PLAYERS: Player[] = [
    // Starters
    { id: 1, name: '닉 포프', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/5aswkaUmC9LaWLVP5mAKoY/d9c42ace61d8e029a9a8bb27199108d9/Nick_Pope_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 2, name: '키어런 트리피어', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/1uKDKPhGWmXg2k9CUi5jYZ/4815b4ff9564d0edd8b60d9bbb1f34df/Kieran_Tripper_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 3, name: '파비안 셰어', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/6ijFzx33lYxI6weymaGAgR/0423cbb7d64022b375235eb6bcdda381/Fabian_Scha%C3%8C_r_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 4, name: '스벤 보트만', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/6Z3u69TthynDExJmxIiyWu/6df2d089d37f1efac2390de5c5fbb4b3/Sven_Botman_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 5, name: '브루노 기마랑이스', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/6Miq89IitsmOFW7hE7qE4A/7c7f158ad8526458eae59d1e7a70c4ce/Bruno_Guimara%C3%8C_es_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 6, name: '조엘린통', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/2q9Rhx184mowzgJfibQtOc/4ebd21e201a6f7c6b47694c16ff71148/Joelinton_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 7, name: '앤서니 고든', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/59HlyM4KUS3kSx1Yeq69QB/056c840b20fbb514767a943aa1b73daf/Anthony_Gordon_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 8, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/4m9reE7NLubcWBKrrW4aQy/5325cb8c7953eca99426c90880911f9c/Alexander_Isak_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 9, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/4m9reE7NLubcWBKrrW4aQy/5325cb8c7953eca99426c90880911f9c/Alexander_Isak_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 10, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/4m9reE7NLubcWBKrrW4aQy/5325cb8c7953eca99426c90880911f9c/Alexander_Isak_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    { id: 11, name: '알렉산더 이삭', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/4m9reE7NLubcWBKrrW4aQy/5325cb8c7953eca99426c90880911f9c/Alexander_Isak_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: true },
    // Subs
    { id: 12, name: '칼럼 윌슨', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/5NEHdabY0GuaYjMS8PXtmX/26561327195122667c4ba38b9a429213/Callum_Wilson_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: false },
    { id: 13, name: '하비 반스', team: '뉴캐슬 유나이티드', photoUrl: 'https://images.ctfassets.net/9ec6988xevcz/2emPVNGtH9zzlGM51t1cpG/fdb6c86536f564a3f0490aeed015654a/Harvey_Barnes_Home_2400.png?fm=webp&fit=fill&f=top', isStarter: false },
];

export const INITIAL_RATINGS: Vote[] = [
  {
    id: '6',
    title: '맨유전 선수 평점을 매겨주세요!',
    type: VoteKind.RATING,
    description: '올드 트래포드 원정에서 승리한 뉴캐슬 선수들의 활약을 평가해주세요. 평점은 1점부터 10점까지 가능합니다.',
    players: RATING_PLAYERS,
    options: RATING_PLAYERS.map(p => {
        const comments: { [key: string]: string[] } = {
            '닉 포프': ['선방쇼! 오늘 승리의 일등공신.', '든든한 최후의 보루.'],
            '키어런 트리피어': ['캡틴의 품격. 완벽한 리더십.', '택배 크로스는 여전하네요.'],
            '파비안 셰어': ['셰어 캐논 한 방 기대했는데 아쉽!', '수비 조율 능력이 뛰어납니다.'],
            '스벤 보트만': ['벽 그 자체. 상대 공격수 삭제.', '제공권 장악력이 엄청나네요.'],
            '브루노 기마랑이스': ['중원의 사령관. 경기를 지배했다.', '탈압박은 월드클래스.', '패스 길이 달라요.'],
            '조엘린통': ['엄청난 활동량으로 중원을 장악!', '전투적인 모습이 너무 좋았어요.'],
            '앤서니 고든': ['스피드로 측면을 파괴!', '저돌적인 돌파가 인상적.'],
            '알렉산더 이삭': ['환상적인 마무리. 역시 해결사!', '오늘 MOM은 이삭.'],
            '칼럼 윌슨': ['교체로 들어와서 활기를 불어넣음.', '역시 베테랑의 품격.'],
            '하비 반스': ['빠른 발로 좋은 기회를 만들었네요.', '다음엔 선발로 보고 싶어요.'],
        };

        return {
            id: p.id,
            label: p.name,
            votes: Math.floor(Math.random() * 200) + 700, // e.g. avg rating 7-9, 100 raters
            ratingCount: 100,
            comments: comments[p.name] || [`최고의 활약!`, `다음 경기도 기대합니다.`],
        };
    }),
    endDate: pastDate(1), 
  },
];

export const INITIAL_VOTES: Vote[] = [
  {
    id: '1',
    title: '뉴캐슬 vs 아스날, 다음 경기 승자는?',
    type: VoteKind.MATCH,
    description: '세인트 제임스 파크에서 열리는 빅매치! 당신의 예상을 투표해주세요.',
    options: [
      { id: 1, label: '뉴캐슬 승', votes: 150 },
      { id: 2, label: '무승부', votes: 45 },
      { id: 3, label: '아스날 승', votes: 80 },
    ],
    endDate: futureDate(5),
  },
  {
    id: '2',
    title: '이번 시즌 뉴캐슬 최고의 선수는?',
    type: VoteKind.PLAYER,
    description: '팬들이 직접 뽑는 뉴캐슬 \'Player of the Season\'!',
    players: MOCK_PLAYERS.slice(0, 4),
    options: [
        { id: 1, label: MOCK_PLAYERS[0].name, votes: 280 },
        { id: 2, label: MOCK_PLAYERS[1].name, votes: 350 },
        { id: 3, label: MOCK_PLAYERS[2].name, votes: 210 },
        { id: 4, label: MOCK_PLAYERS[3].name, votes: 240 },
    ],
    endDate: futureDate(10),
    userVote: 2, // Example of a vote the user already made
  },
  {
    id: '3',
    title: '뉴캐슬의 챔피언스리그 진출, 가능할까?',
    type: VoteKind.TOPIC,
    description: '치열한 TOP 4 경쟁, 뉴캐슬은 다음 시즌 챔피언스리그에 진출할 수 있을까요?',
    imageUrl: 'https://images.ctfassets.net/9ec6988xevcz/1CS74F4kZjJhOqbOPrfMqX/06cc9d1389b50aa3173de2b24a456c81/TEAM_Men.jpg?fm=webp&fit=fill&f=top',
    options: [
      { id: 1, label: '가능하다', votes: 550 },
      { id: 2, label: '어렵다', votes: 210 },
    ],
    endDate: futureDate(2),
  },
  {
    id: '4',
    title: '뉴캐슬 vs 토트넘, 당신의 선택은?',
    type: VoteKind.MATCH,
    description: '치열한 순위 경쟁! 다음 경기에서 승리할 팀을 예측해주세요.',
    options: [
      { id: 1, label: '뉴캐슬 승', votes: 0 },
      { id: 2, label: '무승부', votes: 0 },
      { id: 3, label: '토트넘 승', votes: 0 },
    ],
    endDate: futureDate(20),
  },
  {
    id: '5',
    title: '에디 하우 감독의 재계약, 어떻게 생각하세요?',
    type: VoteKind.TOPIC,
    description: '팀을 성공적으로 이끌고 있는 에디 하우 감독, 재계약에 대한 당신의 의견은?',
    options: [
      { id: 1, label: '찬성', votes: 880 },
      { id: 2, label: '반대', votes: 120 },
    ],
    endDate: pastDate(3), // Expired vote
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
    {
        id: 'q1',
        title: '뉴캐슬 유나이티드 레전드 퀴즈',
        description: '당신은 진정한 \'Toon Army\'인가요? 뉴캐슬의 전설적인 선수들을 맞춰보세요!',
        imageUrl: 'https://picsum.photos/seed/nufc-legends/800/400',
        questions: [
            {
                id: 1,
                text: '뉴캐슬 유나이티드 역대 최다 득점자는 누구일까요?',
                options: [ {id: 1, text: '재키 밀번'}, {id: 2, text: '앨런 시어러'}, {id: 3, text: '레스 퍼디난드'} ],
                correctOptionId: 2,
            },
            {
                id: 2,
                text: '1990년대 "The Entertainers" 시대를 이끈 감독은 누구일까요?',
                options: [ {id: 1, text: '케빈 키건'}, {id: 2, text: '바비 롭슨 경'}, {id: 3, text: '그레이엄 수네스'} ],
                correctOptionId: 1,
            },
            {
                id: 3,
                text: '뉴캐슬의 홈 구장 이름은 무엇일까요?',
                options: [ {id: 1, text: '스포츠 다이렉트 아레나'}, {id: 2, text: '갤로우게이트'}, {id: 3, text: '세인트 제임스 파크'} ],
                correctOptionId: 3,
            }
        ]
    },
    {
        id: 'q2',
        title: '뉴캐슬 현재 스쿼드 등번호 퀴즈',
        description: '현재 뉴캐슬 선수들의 등번호를 맞춰보세요!',
        imageUrl: 'https://picsum.photos/seed/nufc-squad/800/400',
        questions: [
            {
                id: 1,
                text: '뉴캐슬의 중원을 책임지는 브루노 기마랑이스의 등번호는?',
                imageUrl: 'https://picsum.photos/seed/bruno-q/400/300',
                options: [ {id: 1, text: '7'}, {id: 2, text: '8'}, {id: 3, text: '39'} ],
                correctOptionId: 3,
            },
            {
                id: 2,
                text: '뉴캐슬의 상징적인 등번호 9번을 달고 있는 스트라이커는 누구일까요?',
                imageUrl: 'https://picsum.photos/seed/wilson-q/400/300',
                options: [ {id: 1, text: '알렉산더 이삭'}, {id: 2, text: '칼럼 윌슨'}, {id: 3, 'text': '앤서니 고든'} ],
                correctOptionId: 2,
            }
        ]
    }
];
