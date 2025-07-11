


import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Vote, VoteKind, Player, Article, XPost, SquadPlayer, PlayerPosition, UserScorePrediction, Match } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VotePage from './components/VotePage';
import CreateVotePage from './components/CreateVotePage';
import CreateHubPage from './components/CreateHubPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { supabase, Database } from './lib/supabaseClient';
import { MOCK_VOTES, MOCK_RATINGS, MOCK_ARTICLES, MOCK_X_POSTS, MOCK_SQUAD_PLAYERS, MOCK_MATCHES } from './constants';
import { BugIcon } from './components/icons/BugIcon';
import BugReportPage from './components/BugReportPage';
import ArticlePage from './components/ArticlePage';
import CreateArticlePage from './components/CreateArticlePage';
import CreateXPostPage from './components/CreateXPostPage';
import SquadPage from './components/SquadPage';
import XPostPage from './components/XPostPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AuthModal from './components/AuthModal';
import PredictionPage from './components/PredictionPage';
import MatchManagementPage from './components/MatchManagementPage';


export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'players' | 'match_id'> {
  options: {label: string}[];
}

export type ArticleCreationData = Omit<Article, 'id' | 'createdAt' | 'recommendations' | 'userRecommended' | 'views' | 'user_id'>;
export type XPostCreationData = Omit<XPost, 'id' | 'createdAt' | 'user_id'>;

export type SquadPlayerCreationData = Omit<SquadPlayer, 'id' | 'createdAt'>;
export type MatchCreationData = Omit<Match, 'id' | 'created_at' | 'home_score' | 'away_score' | 'is_finished' | 'user_id'>;
export type MatchResultData = { home_score: number; away_score: number; players: Player[]; };


const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { session, authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToast } = useToast();

    useEffect(() => {
        if (!authLoading && !session) {
            addToast('로그인이 필요한 서비스입니다.', 'info');
            navigate('/login', { replace: true, state: { from: location } });
        }
    }, [authLoading, session, navigate, location, addToast]);

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    
    if (!session) {
        return null; // Redirect is handled by the effect
    }

    return children;
};

const AppContent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [ratings, setRatings] = useState<Vote[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [squadPlayers, setSquadPlayers] = useState<SquadPlayer[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { session, authLoading } = useAuth();
  
  const isLocalMode = supabase === null;

  const fetchAllData = useCallback(async () => {
    if (isLocalMode) return;
    try {
      setDataLoading(true);
      // Fetch votes and ratings
      const { data: voteData, error: voteError } = await supabase!
        .from('votes')
        .select(`
          id, title, description, type, image_url, end_date, created_at, players, user_id, match_id,
          options:vote_options(id, label, votes, rating_count, comments)
        `)
        .order('created_at', { ascending: false });
      if (voteError) throw voteError;
      
      const { data: scorePredictionData, error: spError } = await supabase
        .from('score_predictions')
        .select('*');
      if (spError) throw spError;
      
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .order('match_time', { ascending: false });
      if (matchError) throw matchError;
      setMatches(matchData);

      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
      const userScorePredictions = JSON.parse(localStorage.getItem('userScorePredictions') || '{}');

      const allPredictionsMap = scorePredictionData.reduce((acc: {[key:string]: UserScorePrediction[]}, p) => {
          if (!acc[p.vote_id]) {
              acc[p.vote_id] = [];
          }
          acc[p.vote_id].push(p as UserScorePrediction);
          return acc;
      }, {});


      const allVotes: Vote[] = voteData.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        type: v.type,
        endDate: v.end_date,
        createdAt: v.created_at,
        imageUrl: v.image_url,
        players: v.players as Player[] | null,
        user_id: v.user_id,
        match_id: v.match_id,
        options: v.options.map((o: any) => ({
          id: o.id,
          label: o.label,
          votes: o.votes,
          ratingCount: o.rating_count,
          comments: o.comments as string[] | undefined,
        })),
        userVote: userVotes[v.id],
        userRatings: userRatings[v.id],
        userScorePrediction: userScorePredictions[v.id],
        scorePredictions: allPredictionsMap[v.id] || [],
      }));
      setVotes(allVotes.filter(v => v.type !== VoteKind.RATING));
      setRatings(allVotes.filter(v => v.type === VoteKind.RATING));

      // Fetch articles
      const { data: articleData, error: articleError } = await supabase!
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      if (articleError) throw articleError;

      const userRecommendedArticles = JSON.parse(localStorage.getItem('userRecommendedArticles') || '{}');
      const formattedArticles: Article[] = articleData.map((a: any) => ({
        id: a.id,
        createdAt: a.created_at,
        title: a.title,
        body: a.body,
        imageUrl: a.image_url,
        recommendations: a.recommendations,
        views: a.views,
        user_id: a.user_id,
        userRecommended: !!userRecommendedArticles[a.id],
      }));
      setArticles(formattedArticles);
      
      // Fetch X posts
      const { data: xPostData, error: xPostError } = await supabase!
        .from('x_posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (xPostError) throw xPostError;
      setXPosts(xPostData.map((p: any) => ({
        id: p.id,
        createdAt: p.created_at,
        description: p.description,
        postUrl: p.post_url,
        user_id: p.user_id
      })));

      // Fetch squad players
      const { data: squadData, error: squadError } = await supabase!
        .from('squad_players')
        .select('*')
        .order('number', { ascending: true });
      if (squadError) throw squadError;
      setSquadPlayers(squadData.map((p: any) => ({
        id: p.id,
        createdAt: p.created_at,
        name: p.name,
        number: p.number,
        position: p.position as PlayerPosition,
        photoUrl: p.photo_url
      })));
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      addToast(`데이터 로딩 오류: ${error.message}`, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [addToast, isLocalMode]);
  
  // Data loading effect
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (isLocalMode) {
      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
      const userScorePredictions = JSON.parse(localStorage.getItem('userScorePredictions') || '{}');
      const userRecommendedArticles = JSON.parse(localStorage.getItem('userRecommendedArticles') || '{}');
      
      setMatches(JSON.parse(JSON.stringify(MOCK_MATCHES)));
      setVotes(JSON.parse(JSON.stringify(MOCK_VOTES)).map((v: Vote) => ({ ...v, userVote: userVotes[v.id], userScorePrediction: userScorePredictions[v.id] })));
      setRatings(JSON.parse(JSON.stringify(MOCK_RATINGS)).map((r: Vote) => ({ ...r, userRatings: userRatings[r.id] })));
      setArticles(JSON.parse(JSON.stringify(MOCK_ARTICLES)).map((a: Article) => ({ ...a, userRecommended: !!userRecommendedArticles[a.id] })));
      setXPosts(JSON.parse(JSON.stringify(MOCK_X_POSTS)));
      setSquadPlayers(JSON.parse(JSON.stringify(MOCK_SQUAD_PLAYERS)));
      setDataLoading(false);
      addToast('Supabase 연결 실패. 로컬 모드로 실행됩니다.', 'info');
    } else {
      fetchAllData();
    }
  }, [authLoading, isLocalMode, fetchAllData, addToast]);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (authLoading || dataLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  const createVoteInternal = async (voteData: VoteCreationData): Promise<Vote | null> => {
      const voteInsertPayload: Database['public']['Tables']['votes']['Insert'] = {
          title: voteData.title,
          description: voteData.description ?? null,
          type: voteData.type,
          end_date: voteData.endDate,
          image_url: voteData.imageUrl ?? null,
          players: voteData.players ?? null,
          user_id: session!.user.id,
          match_id: voteData.match_id ?? null,
      };

      const { data: vote, error: voteError } = await supabase!.from('votes').insert(voteInsertPayload).select().single();
      if (voteError) throw voteError;

      type VoteOptionInsert = Database['public']['Tables']['vote_options']['Insert'];
      const optionsToInsert: VoteOptionInsert[] = voteData.options.map(opt => ({
          vote_id: vote.id,
          label: opt.label,
      }));
      
      const { data: insertedOptions, error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert).select();
      if (optionsError) throw optionsError;
      
      return {
          id: vote.id,
          createdAt: vote.created_at,
          title: vote.title,
          description: vote.description || undefined,
          type: vote.type as VoteKind,
          endDate: vote.end_date,
          imageUrl: vote.image_url || undefined,
          players: vote.players || undefined,
          user_id: vote.user_id,
          match_id: vote.match_id || undefined,
          options: insertedOptions.map(o => ({
              id: o.id, label: o.label, votes: o.votes, ratingCount: o.rating_count, comments: o.comments || []
          })),
      };
  };

  const handleVote = async (voteId: string, optionId: string) => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }

    const vote = votes.find(v => v.id === voteId);
    if (!vote) return;
    const option = vote.options.find(o => o.id === optionId);
    if (!option) return;

    const updateLocalState = () => {
      setVotes(prevVotes =>
        prevVotes.map(v => {
          if (v.id === voteId) {
            const newOptions = v.options.map(o =>
              o.id === optionId ? { ...o, votes: o.votes + 1 } : o
            );
            return { ...v, options: newOptions, userVote: optionId };
          }
          return v;
        })
      );
      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      userVotes[voteId] = optionId;
      localStorage.setItem('userVotes', JSON.stringify(userVotes));
    };

    if (isLocalMode) {
      updateLocalState();
      return;
    }

    const { error } = await supabase!.rpc('increment_vote', { option_id_to_inc: option.id });
    if (error) {
      addToast(`투표 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
      return;
    }
    updateLocalState();
  };

  const handlePredictScore = async (voteId: string, scoreA: number, scoreB: number) => {
    if (!session) {
        setIsAuthModalOpen(true);
        return;
    }

    const predictionData = { scoreA, scoreB };

    const updateLocalState = () => {
        setVotes(prevVotes =>
            prevVotes.map(v => {
                if (v.id === voteId) {
                    const newPrediction: UserScorePrediction = {
                        id: `local-${Date.now()}`,
                        vote_id: voteId,
                        user_id: session.user.id,
                        score_a: scoreA,
                        score_b: scoreB,
                        created_at: new Date().toISOString()
                    };
                    return {
                        ...v,
                        userScorePrediction: predictionData,
                        scorePredictions: [...(v.scorePredictions || []), newPrediction],
                    };
                }
                return v;
            })
        );
        const userScorePredictions = JSON.parse(localStorage.getItem('userScorePredictions') || '{}');
        userScorePredictions[voteId] = predictionData;
        localStorage.setItem('userScorePredictions', JSON.stringify(userScorePredictions));
        addToast('스코어 예측이 제출되었습니다.', 'success');
    };
    
    if (isLocalMode) {
        updateLocalState();
        return;
    }
    
    const { error } = await supabase!.from('score_predictions').insert({
        vote_id: voteId,
        user_id: session.user.id,
        score_a: scoreA,
        score_b: scoreB
    });

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            addToast('이미 이 경기에 대한 예측을 제출했습니다.', 'error');
        } else {
            addToast(`스코어 예측 제출 실패: ${error.message}`, 'error');
        }
        return;
    }
    await fetchAllData();
  };
  
  const handlePlayerRatingSubmit = async (ratingId: string, playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
    if (!session) {
        setIsAuthModalOpen(true);
        return;
    }
    const updateLocalState = () => {
        setRatings(prevRatings =>
            prevRatings.map(rating => {
                if (rating.id === ratingId) {
                    const newOptions = rating.options.map(option => {
                        const player = rating.players?.find(p => p.name === option.label);
                        if (!player) return option;

                        const playerRatingData = playerRatings[player.id];
                        if (playerRatingData) {
                            return {
                                ...option,
                                votes: option.votes + playerRatingData.rating,
                                ratingCount: (option.ratingCount || 0) + 1,
                                comments: playerRatingData.comment
                                    ? [...(option.comments || []), playerRatingData.comment]
                                    : (option.comments || []),
                            };
                        }
                        return option;
                    });
                    const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');
                    userRatings[ratingId] = playerRatings;
                    localStorage.setItem('userRatings', JSON.stringify(userRatings));
                    return { ...rating, options: newOptions, userRatings: playerRatings };
                }
                return rating;
            })
        );
        addToast('평점이 제출되었습니다. 감사합니다!', 'success');
    };

    if (isLocalMode) {
      updateLocalState();
      return;
    }
    
    try {
        const rating = ratings.find(r => r.id === ratingId);
        if (!rating) throw new Error("Rating not found");

        const updates = Object.entries(playerRatings).map(([playerId, data]) => {
            const player = rating.players?.find(p => p.id === Number(playerId));
            if (!player) return null;
            const option = rating.options.find(o => o.label === player.name);
            if (!option) return null;
            
            const newComments = data.comment ? [...(option.comments || []), data.comment] : (option.comments || []);

            const payload: Database['public']['Tables']['vote_options']['Update'] = {
                votes: option.votes + data.rating,
                rating_count: (option.ratingCount || 0) + 1,
                comments: newComments
            };

            return supabase!.from('vote_options').update(payload).eq('id', option.id);
        }).filter(Boolean);

        const results = await Promise.all(updates);
        const dbError = results.find(res => res && res.error);
        if (dbError && dbError.error) throw dbError.error;

        await fetchAllData();
        addToast('평점이 제출되었습니다. 감사합니다!', 'success');
    } catch (error: any) {
        addToast(`평점 제출 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateVote = async (newVoteData: VoteCreationData) => {
    const commonLogic = (newVote: Vote) => {
        setVotes((prev: Vote[]) => [newVote, ...prev]);
        navigate('/');
        addToast('투표가 성공적으로 생성되었습니다.', 'success');
    };

    if (isLocalMode) {
        const voteToAdd: Vote = {
            ...newVoteData,
            id: `mock-vote-${Date.now()}`,
            createdAt: new Date().toISOString(),
            user_id: 'mock-user-id',
            options: newVoteData.options.map((o, i) => ({
                id: `new-opt-${i}`,
                label: o.label,
                votes: 0,
            })),
        };
        commonLogic(voteToAdd);
        return;
    }

    try {
        const newVote = await createVoteInternal(newVoteData);
        if (newVote) {
           commonLogic(newVote);
        }
    } catch (error: any) {
        addToast(`생성 실패: ${error.message}`, 'error');
    }
  };
  
  const handleCreateMatch = async (matchData: MatchCreationData) => {
      const commonLogic = (newMatch: Match, newPrediction: Vote) => {
        setMatches(prev => [newMatch, ...prev].sort((a, b) => new Date(b.match_time).getTime() - new Date(a.match_time).getTime()));
        setVotes(prev => [newPrediction, ...prev]);
        addToast('경기가 생성되고 스코어 예측이 자동으로 등록되었습니다.', 'success');
      };
      
      if (isLocalMode) {
        const newMatch: Match = {
            ...matchData,
            id: `match-${Date.now()}`,
            created_at: new Date().toISOString(),
            home_score: null, away_score: null, is_finished: false, user_id: 'mock-user-id',
        };
        const newPrediction: Vote = {
            id: `vote-${Date.now()}`, match_id: newMatch.id, createdAt: new Date().toISOString(),
            title: `${matchData.home_team} vs ${matchData.away_team}, 스코어는?`, type: VoteKind.MATCH_PREDICTION,
            description: `${matchData.competition} 빅매치!`, endDate: matchData.match_time,
            options: [{id: '1', label: matchData.home_team, votes:0}, {id: '2', label: matchData.away_team, votes:0}],
            user_id: 'mock-user-id'
        };
        commonLogic(newMatch, newPrediction);
        return;
      }
      
      try {
        const { data: newMatch, error: matchError } = await supabase!.from('matches').insert({
            ...matchData,
            user_id: session!.user.id
        }).select().single();
        if (matchError) throw matchError;

        const predictionVoteData: VoteCreationData = {
            title: `${newMatch.home_team} vs ${newMatch.away_team}, 스코어는?`,
            description: `${newMatch.competition} 경기의 스코어를 맞춰보세요!`,
            type: VoteKind.MATCH_PREDICTION,
            endDate: newMatch.match_time,
            match_id: newMatch.id,
            options: [{label: newMatch.home_team}, {label: newMatch.away_team}]
        };

        const newPrediction = await createVoteInternal(predictionVoteData);
        if(!newPrediction) throw new Error("자동 스코어 예측 생성에 실패했습니다.");

        commonLogic(newMatch, newPrediction);
      } catch (error: any) {
         addToast(`경기 생성 실패: ${error.message}`, 'error');
      }
  };

  const handleUpdateMatch = async (matchId: string, matchData: MatchCreationData) => {
    const commonLogic = (updatedMatch: Match, updatedVote: Vote | undefined) => {
        setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));
        if (updatedVote) {
            setVotes(prev => prev.map(v => v.id === updatedVote.id ? updatedVote : v));
        }
        addToast('경기가 수정되었습니다.', 'success');
    };
    
    if (isLocalMode) {
        const existingMatch = matches.find(m => m.id === matchId)!;
        const updatedMatch: Match = { ...existingMatch, ...matchData };
        let updatedVote: Vote | undefined;
        const prediction = votes.find(v => v.match_id === matchId && v.type === VoteKind.MATCH_PREDICTION);
        if (prediction) {
            updatedVote = {
                ...prediction,
                title: `${matchData.home_team} vs ${matchData.away_team}, 스코어는?`,
                description: `${matchData.competition} 경기의 스코어를 맞춰보세요!`,
                endDate: matchData.match_time,
            }
        }
        commonLogic(updatedMatch, updatedVote);
        return;
    }
    
    try {
        const { data: updatedMatch, error } = await supabase!
            .from('matches')
            .update({
                competition: matchData.competition,
                home_team: matchData.home_team,
                away_team: matchData.away_team,
                match_time: matchData.match_time,
            })
            .eq('id', matchId)
            .select()
            .single();

        if (error) throw error;
        
        let updatedVote: Vote | undefined;
        const predictionVote = votes.find(v => v.match_id === matchId && v.type === VoteKind.MATCH_PREDICTION);
        if (predictionVote) {
             const { data: voteData, error: voteUpdateError } = await supabase!.from('votes')
                 .update({ 
                    title: `${updatedMatch.home_team} vs ${updatedMatch.away_team}, 스코어는?`,
                    description: `${updatedMatch.competition} 경기의 스코어를 맞춰보세요!`,
                    end_date: updatedMatch.match_time,
                 })
                 .eq('id', predictionVote.id)
                 .select(`*, options:vote_options(*)`)
                 .single();

             if (voteUpdateError) {
                console.error("Failed to update prediction title", voteUpdateError);
             } else {
                updatedVote = {
                    id: voteData.id,
                    title: voteData.title,
                    description: voteData.description || undefined,
                    type: voteData.type as VoteKind,
                    endDate: voteData.end_date,
                    createdAt: voteData.created_at,
                    imageUrl: voteData.image_url || undefined,
                    players: voteData.players as Player[] | null,
                    user_id: voteData.user_id,
                    match_id: voteData.match_id || undefined,
                    options: (voteData.options as any[]).map((o: any) => ({
                      id: o.id, label: o.label, votes: o.votes, ratingCount: o.rating_count, comments: o.comments || [],
                    })),
                };
             }
        }
        commonLogic(updatedMatch, updatedVote);
    } catch (error: any) {
        addToast(`경기 수정 실패: ${error.message}`, 'error');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!window.confirm('이 경기를 삭제하시겠습니까? 연관된 모든 예측과 평점 데이터도 함께 삭제됩니다.')) {
        return;
    }

    if (isLocalMode) {
        const associatedVoteIds = [...votes, ...ratings].filter(v => v.match_id === matchId).map(v => v.id);
        setMatches(prev => prev.filter(m => m.id !== matchId));
        setVotes(prev => prev.filter(v => !associatedVoteIds.includes(v.id)));
        setRatings(prev => prev.filter(r => !associatedVoteIds.includes(r.id)));
        addToast('경기가 삭제되었습니다.', 'success');
        return;
    }

    try {
        const { data: voteIds, error: voteIdError } = await supabase!
            .from('votes').select('id').eq('match_id', matchId);
        if (voteIdError) throw voteIdError;
        
        const idsToDelete = voteIds.map(v => v.id);
        if (idsToDelete.length > 0) {
            await supabase!.from('score_predictions').delete().in('vote_id', idsToDelete);
            await supabase!.from('vote_options').delete().in('vote_id', idsToDelete);
            await supabase!.from('votes').delete().in('id', idsToDelete);
        }
        
        const { error: matchDeleteError } = await supabase!.from('matches').delete().eq('id', matchId);
        if (matchDeleteError) throw matchDeleteError;
        
        await fetchAllData(); // Easiest way to refetch all data
        addToast('경기와 관련 콘텐츠가 모두 삭제되었습니다.', 'success');
    } catch (error: any) {
        addToast(`경기 삭제 실패: ${error.message}`, 'error');
    }
  };

  const handleSubmitMatchResult = async (matchId: string, resultData: MatchResultData) => {
    const existingRating = ratings.find(r => r.match_id === matchId);

    // --- MOCK MODE ---
    if (isLocalMode) {
        const match = matches.find(m => m.id === matchId)!;
        const updatedMatch: Match = {...match, home_score: resultData.home_score, away_score: resultData.away_score, is_finished: true };
        setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));

        if (!existingRating) {
            const newRating: Vote = {
                id: `rating-${Date.now()}`, match_id: match.id, createdAt: new Date().toISOString(),
                title: `${match.home_team} vs ${match.away_team} 선수 평점`, type: VoteKind.RATING,
                description: '경기에 출전한 선수들의 활약을 평가해주세요.',
                endDate: new Date(new Date(match.match_time).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                players: resultData.players,
                options: resultData.players.map(p => ({ id: String(p.id), label: p.name, votes: 0, ratingCount: 0, comments: []})),
                user_id: 'mock-user-id'
            };
            setRatings(prev => [newRating, ...prev]);
            addToast('경기 결과가 입력되고 선수 평점이 자동으로 생성되었습니다.', 'success');
        } else {
            addToast('경기 결과가 수정되었습니다.', 'success');
        }
        return;
    }
    
    // --- SUPABASE MODE ---
    try {
        const { data: updatedMatch, error: matchError } = await supabase!.from('matches')
            .update({ home_score: resultData.home_score, away_score: resultData.away_score, is_finished: true })
            .eq('id', matchId)
            .select()
            .single();
        if (matchError) throw matchError;

        if (!existingRating) {
            // Create a new rating
            const ratingEndDate = new Date(new Date(updatedMatch.match_time).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
            const ratingVoteData: VoteCreationData = {
                title: `${updatedMatch.home_team} vs ${updatedMatch.away_team} 선수 평점`,
                description: `${updatedMatch.competition} 경기에 출전한 선수들의 활약을 평가해주세요.`,
                type: VoteKind.RATING,
                endDate: ratingEndDate,
                match_id: updatedMatch.id,
                players: resultData.players,
                options: resultData.players.map(p => ({ label: p.name }))
            };
            const newRating = await createVoteInternal(ratingVoteData);
            if (!newRating) throw new Error("선수 평점 자동 생성에 실패했습니다.");

            setRatings(prev => [newRating, ...prev]);
            addToast('경기 결과가 입력되고 선수 평점이 자동으로 생성되었습니다.', 'success');
        } else {
             addToast('경기 결과가 수정되었습니다.', 'success');
        }
        
        // Always update the match in local state
        setMatches(prev => prev.map(m => m.id === matchId ? updatedMatch : m));

    } catch (error: any) {
        addToast(`결과 처리 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateArticle = async (newArticleData: ArticleCreationData) => {
    const commonLogic = (newArticle: Article) => {
      setArticles(prev => [newArticle, ...prev]);
      navigate('/');
      addToast('아티클이 성공적으로 생성되었습니다.', 'success');
    };

    if (isLocalMode) {
      const articleToAdd: Article = {
        ...newArticleData,
        id: `mock-article-${Date.now()}`,
        createdAt: new Date().toISOString(),
        recommendations: 0,
        views: 0,
        userRecommended: false,
        user_id: 'mock-user-id',
      };
      commonLogic(articleToAdd);
      return;
    }

    try {
      const { data, error } = await supabase!.from('articles').insert({
        title: newArticleData.title,
        body: newArticleData.body,
        image_url: newArticleData.imageUrl ?? null,
        user_id: session!.user.id,
      }).select().single();
      if (error) throw error;
      
      const newArticle: Article = {
        id: data.id,
        createdAt: data.created_at,
        title: data.title,
        body: data.body,
        imageUrl: data.image_url || undefined,
        recommendations: 0,
        views: 0,
        user_id: data.user_id,
        userRecommended: false
      };

      commonLogic(newArticle);
    } catch (error: any) {
      addToast(`아티클 생성 실패: ${error.message}`, 'error');
    }

  };

  const handleRecommendArticle = async (articleId: string) => {
    if (!session) {
      setIsAuthModalOpen(true);
      return;
    }

    const recommendedArticles = JSON.parse(localStorage.getItem('userRecommendedArticles') || '{}');
    if (recommendedArticles[articleId]) {
      addToast('이미 추천한 아티클입니다.', 'info');
      return;
    }
    
    const updateLocalState = () => {
      setArticles(prev => prev.map(a =>
        a.id === articleId
          ? { ...a, recommendations: a.recommendations + 1, userRecommended: true }
          : a
      ));
      recommendedArticles[articleId] = true;
      localStorage.setItem('userRecommendedArticles', JSON.stringify(recommendedArticles));
    };

    if (isLocalMode) {
      updateLocalState();
      return;
    }
    
    const { error } = await supabase!.rpc('increment_recommendation', { article_id_to_inc: articleId });
    if (error) {
      addToast(`추천 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
      return;
    }
    updateLocalState();

  };

  const handleViewArticle = async (articleId: string) => {
    const viewedArticles = JSON.parse(sessionStorage.getItem('viewedArticles') || '{}');
    if (viewedArticles[articleId]) {
      return; // Already viewed in this session
    }

    const updateLocalState = () => {
      setArticles(prev => prev.map(a => 
        a.id === articleId ? { ...a, views: (a.views || 0) + 1 } : a
      ));
      viewedArticles[articleId] = true;
      sessionStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
    };

    if (isLocalMode) {
      updateLocalState();
      return;
    }

    const { error } = await supabase!.rpc('increment_article_view', { article_id_to_inc: articleId });
    if (error) {
      console.error(`Failed to increment view for article ${articleId}:`, error.message);
    }
    updateLocalState();
  };

  const handleCreateXPost = async (newXPostData: XPostCreationData) => {
    const commonLogic = (newPost: XPost) => {
      setXPosts((prev: XPost[]) => [newPost, ...prev]);
      navigate('/');
      addToast('최신 소식이 성공적으로 등록되었습니다.', 'success');
    };

    if (isLocalMode) {
      const postToAdd: XPost = {
        ...newXPostData,
        id: `mock-x-post-${Date.now()}`,
        createdAt: new Date().toISOString(),
        user_id: 'mock-user-id',
      };
      commonLogic(postToAdd);
      return;
    }

    try {
      const { data, error } = await supabase!.from('x_posts').insert({
        description: newXPostData.description,
        post_url: newXPostData.postUrl,
        user_id: session!.user.id,
      }).select().single();

      if (error) throw error;
      
      const newPost: XPost = {
        id: data.id,
        createdAt: data.created_at,
        description: data.description,
        postUrl: data.post_url,
        user_id: data.user_id,
      };

      commonLogic(newPost);
    } catch (error: any) {
      addToast(`소식 등록 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateBugReport = async ({ title, description, url, screenshotFile }: { title: string; description: string; url: string; screenshotFile: File | null; }) => {
    if (isLocalMode) {
      addToast('로컬 모드에서는 오류 제보를 할 수 없습니다.', 'error');
      return;
    }

    try {
      let screenshot_url: string | null = null;
      if (screenshotFile) {
        const filePath = `public/${Date.now()}-${screenshotFile.name}`;
        const { error: uploadError } = await supabase!.storage
          .from('bug_screenshots')
          .upload(filePath, screenshotFile);
        
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase!.storage
          .from('bug_screenshots')
          .getPublicUrl(filePath);
        
        screenshot_url = urlData.publicUrl;
      }
      
      const { error: insertError } = await supabase!.from('bug_reports').insert({
        title,
        description,
        url,
        screenshot_url
      });

      if (insertError) throw insertError;

      addToast('오류 제보가 성공적으로 제출되었습니다. 감사합니다!', 'success');
      navigate('/');

    } catch (error: any) {
      addToast(`오류 제보 제출 실패: ${error.message}`, 'error');
      console.error('Bug report submission error:', error);
    }
  };

  const handleCreateSquadPlayer = async (playerData: SquadPlayerCreationData) => {
    if (isLocalMode) {
      const newPlayer: SquadPlayer = {
        ...playerData,
        id: `sq-player-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setSquadPlayers(prev => [...prev, newPlayer].sort((a,b) => a.number - b.number));
      addToast('선수가 추가되었습니다.', 'success');
      return;
    }

    try {
      const { data, error } = await supabase!.from('squad_players').insert({
        name: playerData.name,
        number: playerData.number,
        position: playerData.position,
        photo_url: playerData.photoUrl ?? null,
      }).select().single();

      if (error) throw error;
      const newPlayer: SquadPlayer = {
        id: data.id,
        createdAt: data.created_at,
        name: data.name,
        number: data.number,
        position: data.position as PlayerPosition,
        photoUrl: data.photo_url || undefined,
      };
      setSquadPlayers(prev => [...prev, newPlayer].sort((a,b) => a.number - b.number));
      addToast('선수가 추가되었습니다.', 'success');
    } catch (error: any) {
      addToast(`선수 추가 실패: ${error.message}`, 'error');
    }
  };

  const handleUpdateSquadPlayer = async (playerId: string, playerData: SquadPlayerCreationData) => {
     if (isLocalMode) {
      setSquadPlayers(prev => prev.map(p => p.id === playerId ? { ...p, ...playerData, id: playerId, createdAt: p.createdAt } : p).sort((a,b) => a.number - b.number));
      addToast('선수 정보가 수정되었습니다.', 'success');
      return;
    }
    
    try {
      const { data, error } = await supabase!.from('squad_players').update({
        name: playerData.name,
        number: playerData.number,
        position: playerData.position,
        photo_url: playerData.photoUrl ?? null,
      }).eq('id', playerId).select().single();

      if (error) throw error;
       const updatedPlayer: SquadPlayer = {
        id: data.id,
        createdAt: data.created_at,
        name: data.name,
        number: data.number,
        position: data.position as PlayerPosition,
        photoUrl: data.photo_url || undefined,
      };
      setSquadPlayers(prev => prev.map(p => p.id === playerId ? updatedPlayer : p).sort((a,b) => a.number - b.number));
      addToast('선수 정보가 수정되었습니다.', 'success');
    } catch (error: any) {
      addToast(`선수 정보 수정 실패: ${error.message}`, 'error');
    }
  };

  const handleDeleteSquadPlayer = async (playerId: string) => {
     if (isLocalMode) {
      setSquadPlayers(prev => prev.filter(p => p.id !== playerId));
      addToast('선수가 삭제되었습니다.', 'success');
      return;
    }

    try {
      const { error } = await supabase!.from('squad_players').delete().eq('id', playerId);
      if (error) throw error;
      setSquadPlayers(prev => prev.filter(p => p.id !== playerId));
      addToast('선수가 삭제되었습니다.', 'success');
    } catch (error: any) {
      addToast(`선수 삭제 실패: ${error.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 flex-grow">
        <Routes>
          <Route path="/" element={<HomePage votes={votes} ratings={ratings} articles={articles} xPosts={xPosts} matches={matches} />} />
          <Route path="/vote/:id" element={<VotePage votes={votes} onVote={handleVote} onRatePlayers={() => {}} />} />
          <Route path="/prediction/:id" element={<PredictionPage votes={votes} onPredictScore={handlePredictScore} />} />
          <Route path="/rating/:id" element={<VotePage ratings={ratings} onVote={handleVote} onRatePlayers={handlePlayerRatingSubmit} />} />
          <Route path="/article/:id" element={<ArticlePage articles={articles} onRecommend={handleRecommendArticle} onView={handleViewArticle} />} />
          <Route path="/x-post/:id" element={<XPostPage xPosts={xPosts} />} />
          <Route path="/report-bug" element={<BugReportPage onSubmit={handleCreateBugReport} />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route path="/create" element={<ProtectedRoute><CreateHubPage /></ProtectedRoute>} />
          <Route path="/create/vote" element={<ProtectedRoute><CreateVotePage onCreateVote={handleCreateVote} squadPlayers={squadPlayers} /></ProtectedRoute>} />
          <Route path="/create/article" element={<ProtectedRoute><CreateArticlePage onCreateArticle={handleCreateArticle} /></ProtectedRoute>} />
          <Route path="/create/x-post" element={<ProtectedRoute><CreateXPostPage onCreateXPost={handleCreateXPost} /></ProtectedRoute>} />
          <Route path="/squad" element={<ProtectedRoute><SquadPage players={squadPlayers} onAddPlayer={handleCreateSquadPlayer} onUpdatePlayer={handleUpdateSquadPlayer} onDeletePlayer={handleDeleteSquadPlayer} /></ProtectedRoute>} />
          <Route path="/matches" element={
              <ProtectedRoute>
                  <MatchManagementPage 
                      matches={matches} 
                      ratings={ratings}
                      squadPlayers={squadPlayers}
                      onCreateMatch={handleCreateMatch} 
                      onUpdateMatch={handleUpdateMatch}
                      onDeleteMatch={handleDeleteMatch}
                      onSubmitMatchResult={handleSubmitMatchResult} 
                  />
              </ProtectedRoute>
          } />
        </Routes>
      </main>
      <footer className="py-8 mt-8 border-t bg-gray-100">
        <div className="text-center text-gray-500 max-w-7xl mx-auto px-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} SoccerVote. All rights reserved.</p>
          <button onClick={() => navigate('/report-bug', { state: { from: location.pathname } })} className="mt-2 text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mx-auto">
            <BugIcon className="w-4 h-4" />
            오류 제보
          </button>
        </div>
      </footer>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
};


export default App;