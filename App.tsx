
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Vote, Player, Article, XPost, SquadPlayer, PlayerPosition, ArticleUpdateData, XPostUpdateData, Profile, UserVote, PlayerRating, PlayerRatingSubmission, VoteKind } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VotePage from './components/VotePage';
import CreateVotePage from './components/CreateVotePage';
import CreateHubPage from './components/CreateHubPage';
import CreateRatingPage from './components/CreateRatingPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { supabase, Database } from './lib/supabaseClient';
import { MOCK_VOTES, MOCK_PLAYER_RATINGS, MOCK_ARTICLES, MOCK_X_POSTS, MOCK_SQUAD_PLAYERS } from './constants';
import { BugIcon } from './components/icons/BugIcon';
import BugReportPage from './components/BugReportPage';
import ArticlePage from './components/ArticlePage';
import CreateArticlePage from './components/CreateArticlePage';
import EditArticlePage from './components/EditArticlePage';
import CreateXPostPage from './components/CreateXPostPage';
import EditXPostPage from './components/EditXPostPage';
import SquadPage from './components/SquadPage';
import XPostPage from './components/XPostPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import AuthModal from './components/AuthModal';
import PlayerRatingDetailPage from './components/PlayerRatingDetailPage';


export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'teamA' | 'teamB'> {
  options: {label: string}[];
  players?: Player[]; // Only for Player type
}

export interface PlayerRatingCreationData extends Pick<PlayerRating, 'title' | 'description' | 'endDate' | 'imageUrl' | 'players'> {}

export type ArticleCreationData = Omit<Article, 'id' | 'createdAt' | 'recommendations' | 'userRecommended' | 'views' | 'user_id' | 'author'>;
export type XPostCreationData = Omit<XPost, 'id' | 'createdAt' | 'user_id' | 'author'>;

export type SquadPlayerCreationData = Omit<SquadPlayer, 'id' | 'createdAt'>;

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
  const [playerRatings, setPlayerRatings] = useState<PlayerRating[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [squadPlayers, setSquadPlayers] = useState<SquadPlayer[]>([]);
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
      // Fetch votes
      const { data: voteData, error: voteError } = await supabase!
        .from('votes')
        .select(`*, options:vote_options(*)`)
        .order('created_at', { ascending: false });
      if (voteError) throw voteError;
      
      let userVotesFromDb: UserVote[] = [];
      if (session) {
          const { data, error } = await supabase!
              .from('user_votes')
              .select('vote_id, vote_value')
              .eq('user_id', session.user.id);
          if (error) throw error;
          if (data) userVotesFromDb = data;
      }
      
      const userVoteMap: { [voteId: string]: string } = {};
      userVotesFromDb.forEach(uv => { userVoteMap[uv.vote_id] = uv.vote_value; });

      setVotes((voteData || []).map((v) => ({
        ...v,
        imageUrl: v.image_url,
        endDate: v.end_date,
        createdAt: v.created_at,
        teamA: v.team_a,
        teamB: v.team_b,
        finalScore: v.final_score,
        userVote: userVoteMap[v.id],
        players: v.players ?? undefined,
      } as Vote)));

      // Fetch Player Ratings and their stats
      const { data: ratingData, error: ratingError } = await supabase!
          .from('player_ratings')
          .select('*, stats:player_rating_stats(*)')
          .order('created_at', { ascending: false });
      if (ratingError) throw ratingError;

      let userSubmissions: PlayerRatingSubmission[] = [];
      if (session) {
          const { data, error } = await supabase!
              .from('player_rating_submissions')
              .select('*')
              .eq('user_id', session.user.id);
          if (error) throw error;
          userSubmissions = data.map(s => ({
              ...s,
              ratingId: s.rating_id,
              userId: s.user_id,
              playerId: s.player_id,
          }));
      }
      
      setPlayerRatings((ratingData || []).map(r => {
          const relatedSubmissions = userSubmissions.filter(s => s.ratingId === r.id);
          return {
              ...r,
              imageUrl: r.image_url,
              endDate: r.end_date,
              createdAt: r.created_at,
              players: r.players,
              stats: r.stats.map((s: any) => ({
                playerId: s.player_id,
                playerName: s.player_name,
                averageRating: s.average_rating,
                ratingCount: s.rating_count,
                comments: s.comments || [],
              })),
              userSubmission: relatedSubmissions.length > 0 ? relatedSubmissions : undefined,
          } as PlayerRating
      }));


      // Fetch articles
      const { data: articleData, error: articleError } = await supabase!
        .from('articles')
        .select('*, author:profiles(id, nickname)')
        .order('created_at', { ascending: false });
      if (articleError) throw articleError;

      const userRecommendedArticles = JSON.parse(localStorage.getItem('userRecommendedArticles') || '{}');
      const formattedArticles: Article[] = (articleData || []).map((a) => ({
        id: a.id,
        createdAt: a.created_at,
        title: a.title,
        body: a.body,
        imageUrl: a.image_url,
        recommendations: a.recommendations,
        views: a.views,
        user_id: a.user_id,
        author: Array.isArray(a.author) ? a.author[0] : a.author,
        userRecommended: !!userRecommendedArticles[a.id],
      }));
      setArticles(formattedArticles);
      
      // Fetch X posts
      const { data: xPostData, error: xPostError } = await supabase!
        .from('x_posts')
        .select('*, author:profiles(id, nickname)')
        .order('created_at', { ascending: false });
      if (xPostError) throw xPostError;
      setXPosts((xPostData || []).map((p) => ({
        id: p.id,
        createdAt: p.created_at,
        description: p.description,
        postUrl: p.post_url,
        user_id: p.user_id,
        author: Array.isArray(p.author) ? p.author[0] : p.author,
      })));

      // Fetch squad players
      const { data: squadData, error: squadError } = await supabase!
        .from('squad_players')
        .select('*')
        .order('number', { ascending: true });
      if (squadError) throw squadError;
      setSquadPlayers((squadData || []).map((p) => ({
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
  }, [addToast, isLocalMode, session]);
  
  // Data loading effect
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (isLocalMode) {
      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const userRecommendedArticles = JSON.parse(localStorage.getItem('userRecommendedArticles') || '{}');

      setVotes(JSON.parse(JSON.stringify(MOCK_VOTES)).map((v: Vote) => ({ ...v, userVote: userVotes[v.id] })));
      setPlayerRatings(JSON.parse(JSON.stringify(MOCK_PLAYER_RATINGS)));
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

  const handleVote = async (voteId: string, optionId: string) => {
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

  const handleCastOrUpdateScoreVote = async (voteId: string, score: string) => {
      if (!session) {
          setIsAuthModalOpen(true);
          return;
      }

      if (isLocalMode) {
          addToast('로컬 모드에서는 스코어 예측을 할 수 없습니다.', 'info');
          return;
      }

      try {
          const { error } = await supabase!.rpc('cast_or_update_score_vote', {
              vote_id_in: voteId,
              user_id_in: session.user.id,
              score_label_in: score
          });
          if (error) throw error;
          
          addToast('스코어 예측이 제출(수정)되었습니다!', 'success');
          await fetchAllData();
      } catch (error: any) {
          addToast(`스코어 예측 실패: ${error.message}`, 'error');
      }
  };

  const handleEnterMatchResult = async (voteId: string, finalScore: string) => {
      if (!session) {
          setIsAuthModalOpen(true);
          return;
      }
      if (isLocalMode) {
          addToast('로컬 모드에서는 결과 입력을 할 수 없습니다.', 'info');
          return;
      }
      try {
          const { error } = await supabase!.rpc('enter_match_result', {
              vote_id_in: voteId,
              final_score_in: finalScore
          });
          if (error) throw error;
          
          addToast('경기 결과가 성공적으로 입력되었습니다.', 'success');
          await fetchAllData();
      } catch (error: any) {
          addToast(`결과 입력 실패: ${error.message}`, 'error');
      }
  };
  
  const handlePlayerRatingSubmit = async (ratingId: string, submissions: Omit<PlayerRatingSubmission, 'userId' | 'ratingId'>[]) => {
    if (!session) {
        setIsAuthModalOpen(true);
        return;
    }

    if (isLocalMode) {
      addToast('평점이 제출되었습니다. (로컬)', 'success');
      // In local mode, we don't have a DB to aggregate, so we just show submitted state
      setPlayerRatings(prev => prev.map(r => r.id === ratingId ? { ...r, userSubmission: [{ratingId, userId: 'mock-user', playerId: 1, rating: 10, comment: 'test'}] } : r));
      return;
    }
    
    try {
        const submissionsPayload: Database['public']['Tables']['player_rating_submissions']['Insert'][] = submissions.map(s => ({
            rating_id: ratingId,
            user_id: session.user.id,
            player_id: s.playerId,
            rating: s.rating,
            comment: s.comment,
        }));
        
        const { error } = await supabase!.from('player_rating_submissions').upsert(submissionsPayload, {
            onConflict: 'rating_id, user_id, player_id'
        });

        if (error) throw error;

        addToast('평점이 제출되었습니다. 감사합니다!', 'success');
        await fetchAllData(); // Refresh all data from DB to show new aggregate results
    } catch (error: any) {
        addToast(`평점 제출 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateVote = async (newVoteData: VoteCreationData) => {
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
            players: newVoteData.players,
        };
        setVotes((prev: Vote[]) => [voteToAdd, ...prev]);
        navigate('/');
        addToast('투표가 성공적으로 생성되었습니다.', 'success');
        return;
    }

    try {
        const voteInsertPayload: Database['public']['Tables']['votes']['Insert'] = {
            title: newVoteData.title,
            description: newVoteData.description ?? null,
            type: newVoteData.type,
            end_date: newVoteData.endDate,
            image_url: newVoteData.imageUrl ?? null,
            user_id: session!.user.id,
            team_a: newVoteData.teamA ?? null,
            team_b: newVoteData.teamB ?? null,
            players: newVoteData.type === VoteKind.PLAYER ? newVoteData.players ?? null : null,
        };

        const { data: vote, error: voteError } = await supabase!
            .from('votes')
            .insert(voteInsertPayload)
            .select()
            .single();

        if (voteError) throw voteError;
        if (!vote) throw new Error("Vote creation failed, no data returned.");
        
        // For Player type, create options from players
        if(newVoteData.type === VoteKind.PLAYER && newVoteData.players) {
            const optionsToInsert: Database['public']['Tables']['vote_options']['Insert'][] = newVoteData.players.map(p => ({
                vote_id: vote.id,
                label: p.name
            }));
             if (optionsToInsert.length > 0) {
                const { error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert);
                if (optionsError) throw optionsError;
            }
        } else if (newVoteData.options.length > 0) {
            const optionsToInsert: Database['public']['Tables']['vote_options']['Insert'][] = newVoteData.options.map((opt) => ({
                vote_id: vote.id,
                label: opt.label,
            }));
            const { error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert);
            if (optionsError) throw optionsError;
        }
        
        await fetchAllData();
        navigate('/');
        addToast('투표가 성공적으로 생성되었습니다.', 'success');

    } catch (error: any) {
        addToast(`투표 생성 실패: ${error.message}`, 'error');
    }
  };

  const handleCreatePlayerRating = async (newRatingData: PlayerRatingCreationData) => {
     if (isLocalMode) {
        const ratingToAdd: PlayerRating = {
            ...newRatingData,
            id: `mock-rating-${Date.now()}`,
            createdAt: new Date().toISOString(),
            user_id: 'mock-user-id',
            stats: [],
        };
        setPlayerRatings(prev => [ratingToAdd, ...prev]);
        navigate('/');
        addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');
        return;
    }

    try {
        const ratingInsertPayload: Database['public']['Tables']['player_ratings']['Insert'] = {
            title: newRatingData.title,
            description: newRatingData.description ?? null,
            end_date: newRatingData.endDate,
            image_url: newRatingData.imageUrl ?? null,
            players: newRatingData.players,
            user_id: session!.user.id,
        };
        const { data: rating, error } = await supabase!.from('player_ratings').insert(ratingInsertPayload).select().single();

        if (error) throw error;
        if (!rating) throw new Error("Rating creation failed");

        await fetchAllData();
        navigate('/');
        addToast('평점이 성공적으로 생성되었습니다.', 'success');

    } catch (error: any) {
        addToast(`평점 생성 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateArticle = async (newArticleData: ArticleCreationData) => {
    if (isLocalMode) {
      const articleToAdd: Article = {
        ...newArticleData,
        id: `mock-article-${Date.now()}`,
        createdAt: new Date().toISOString(),
        recommendations: 0,
        views: 0,
        userRecommended: false,
        author: { id: session!.user.id, nickname: '나' },
      };
      setArticles(prev => [articleToAdd, ...prev]);
      navigate('/');
      addToast('아티클이 성공적으로 생성되었습니다.', 'success');
      return;
    }

    try {
      const articleInsertPayload: Database['public']['Tables']['articles']['Insert'] = {
        title: newArticleData.title,
        body: newArticleData.body,
        image_url: newArticleData.imageUrl ?? null,
        user_id: session!.user.id,
      };
      const { data, error } = await supabase!.from('articles').insert(articleInsertPayload).select('*, author:profiles(id, nickname)').single();

      if (error) throw error;
      if (!data) throw new Error('Article creation failed');
      
      const newArticle: Article = {
        id: data.id,
        createdAt: data.created_at,
        title: data.title,
        body: data.body,
        imageUrl: data.image_url || undefined,
        recommendations: 0,
        views: 0,
        user_id: data.user_id,
        author: Array.isArray(data.author) ? data.author[0] : data.author,
        userRecommended: false
      };
      setArticles(prev => [newArticle, ...prev]);
      navigate('/');
      addToast('아티클이 성공적으로 생성되었습니다.', 'success');
    } catch (error: any) {
      addToast(`아티클 생성 실패: ${error.message}`, 'error');
    }

  };
  
  const handleUpdateArticle = async (articleId: string, updateData: ArticleUpdateData) => {
    if (isLocalMode) {
      setArticles(prev => prev.map(a => a.id === articleId ? {...a, ...updateData} : a));
      navigate(`/article/${articleId}`);
      addToast('아티클이 수정되었습니다.', 'success');
      return;
    }
    
    try {
      const articleUpdatePayload: Database['public']['Tables']['articles']['Update'] = {
        title: updateData.title,
        body: updateData.body,
        image_url: updateData.imageUrl ?? null
      };
      const { data, error } = await supabase!.from('articles').update(articleUpdatePayload).eq('id', articleId).select('*, author:profiles(id, nickname)').single();
      
      if (error) throw error;
      if (!data) throw new Error('Article update failed');

      const updatedArticle: Article = {
        id: data.id,
        createdAt: data.created_at,
        title: data.title,
        body: data.body,
        imageUrl: data.image_url || undefined,
        recommendations: data.recommendations,
        views: data.views,
        user_id: data.user_id,
        author: Array.isArray(data.author) ? data.author[0] : data.author
      };

      setArticles(prev => prev.map(a => a.id === articleId ? {...a, ...updatedArticle} : a));
      navigate(`/article/${articleId}`);
      addToast('아티클이 수정되었습니다.', 'success');

    } catch (error: any) {
      addToast(`아티클 수정 실패: ${error.message}`, 'error');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    if (!window.confirm("정말로 이 아티클을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    if (isLocalMode) {
      setArticles(prev => prev.filter(a => a.id !== articleId));
      navigate('/');
      addToast('아티클이 삭제되었습니다.', 'success');
      return;
    }
  
    try {
      const { error } = await supabase!.from('articles').delete().eq('id', articleId);
      if (error) throw error;
      setArticles(prev => prev.filter(a => a.id !== articleId));
      navigate('/');
      addToast('아티클이 삭제되었습니다.', 'success');
    } catch (error: any) {
      addToast(`아티클 삭제 실패: ${error.message}`, 'error');
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
     if (isLocalMode) {
      const postToAdd: XPost = {
        ...newXPostData,
        id: `mock-x-post-${Date.now()}`,
        createdAt: new Date().toISOString(),
        author: { id: session!.user.id, nickname: '나' },
      };
      setXPosts((prev: XPost[]) => [postToAdd, ...prev]);
      navigate('/');
      addToast('최신 소식이 성공적으로 등록되었습니다.', 'success');
      return;
    }

    try {
      const xpostInsertPayload: Database['public']['Tables']['x_posts']['Insert'] = {
        description: newXPostData.description,
        post_url: newXPostData.postUrl,
        user_id: session!.user.id,
      };
      const { data, error } = await supabase!.from('x_posts').insert(xpostInsertPayload).select('*, author:profiles(id, nickname)').single();

      if (error) throw error;
      if (!data) throw new Error('XPost creation failed');
      
      const newPost: XPost = {
        id: data.id,
        createdAt: data.created_at,
        description: data.description,
        postUrl: data.post_url,
        user_id: data.user_id,
        author: Array.isArray(data.author) ? data.author[0] : data.author,
      };

      setXPosts((prev: XPost[]) => [newPost, ...prev]);
      navigate('/');
      addToast('최신 소식이 성공적으로 등록되었습니다.', 'success');
    } catch (error: any) {
      addToast(`소식 등록 실패: ${error.message}`, 'error');
    }
  };

  const handleUpdateXPost = async (postId: string, updateData: XPostUpdateData) => {
    if (isLocalMode) {
      setXPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updateData } : p));
      navigate(`/x-post/${postId}`);
      addToast('소식이 수정되었습니다.', 'success');
      return;
    }

    try {
      const xpostUpdatePayload: Database['public']['Tables']['x_posts']['Update'] = {
        description: updateData.description,
        post_url: updateData.postUrl,
      };
      const { data, error } = await supabase!.from('x_posts').update(xpostUpdatePayload).eq('id', postId).select('*, author:profiles(id, nickname)').single();

      if (error) throw error;
      if (!data) throw new Error('XPost update failed');
      
      const updatedPost: XPost = {
        id: data.id,
        createdAt: data.created_at,
        description: data.description,
        postUrl: data.post_url,
        user_id: data.user_id,
        author: Array.isArray(data.author) ? data.author[0] : data.author,
      };

      setXPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
      navigate(`/x-post/${postId}`);
      addToast('소식이 수정되었습니다.', 'success');
    } catch (error: any) {
      addToast(`소식 수정 실패: ${error.message}`, 'error');
    }
  };

  const handleDeleteXPost = async (postId: string) => {
    if (!window.confirm("정말로 이 소식을 삭제하시겠습니까?")) return;

    if (isLocalMode) {
      setXPosts(prev => prev.filter(p => p.id !== postId));
      navigate('/');
      addToast('소식이 삭제되었습니다.', 'success');
      return;
    }

    try {
      const { error } = await supabase!.from('x_posts').delete().eq('id', postId);
      if (error) throw error;
      setXPosts(prev => prev.filter(p => p.id !== postId));
      navigate('/');
      addToast('소식이 삭제되었습니다.', 'success');
    } catch (error: any) {
      addToast(`소식 삭제 실패: ${error.message}`, 'error');
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
      
      const bugReportPayload: Database['public']['Tables']['bug_reports']['Insert'] = {
        title,
        description,
        url,
        screenshot_url
      };
      const { error: insertError } = await supabase!.from('bug_reports').insert(bugReportPayload);

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
      const squadPlayerPayload: Database['public']['Tables']['squad_players']['Insert'] = {
        name: playerData.name,
        number: playerData.number,
        position: playerData.position,
        photo_url: playerData.photoUrl ?? null,
      };
      const { data, error } = await supabase!.from('squad_players').insert(squadPlayerPayload).select().single();

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
      const squadPlayerUpdatePayload: Database['public']['Tables']['squad_players']['Update'] = {
        name: playerData.name,
        number: playerData.number,
        position: playerData.position,
        photo_url: playerData.photoUrl ?? null,
      };
      const { data, error } = await supabase!.from('squad_players').update(squadPlayerUpdatePayload).eq('id', playerId).select().single();

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
          <Route path="/" element={<HomePage votes={votes} playerRatings={playerRatings} articles={articles} xPosts={xPosts} />} />
          <Route path="/vote/:id" element={<VotePage votes={votes} onVote={handleVote} onUpdateScoreVote={handleCastOrUpdateScoreVote} onEnterResult={handleEnterMatchResult} />} />
          <Route path="/rating/:id" element={<PlayerRatingDetailPage playerRatings={playerRatings} onRatePlayers={handlePlayerRatingSubmit} onRequestLogin={() => setIsAuthModalOpen(true)} />} />
          <Route path="/article/:id" element={<ArticlePage articles={articles} onRecommend={handleRecommendArticle} onView={handleViewArticle} onDelete={handleDeleteArticle} />} />
          <Route path="/x-post/:id" element={<XPostPage xPosts={xPosts} onDelete={handleDeleteXPost} />} />
          <Route path="/report-bug" element={<BugReportPage onSubmit={handleCreateBugReport} />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Protected Routes */}
          <Route path="/create" element={<ProtectedRoute><CreateHubPage /></ProtectedRoute>} />
          <Route path="/create/vote" element={<ProtectedRoute><CreateVotePage onCreateVote={handleCreateVote} squadPlayers={squadPlayers} /></ProtectedRoute>} />
          <Route path="/create/rating" element={<ProtectedRoute><CreateRatingPage onCreateRating={handleCreatePlayerRating} squadPlayers={squadPlayers} /></ProtectedRoute>} />
          <Route path="/create/article" element={<ProtectedRoute><CreateArticlePage onCreateArticle={handleCreateArticle} /></ProtectedRoute>} />
          <Route path="/create/x-post" element={<ProtectedRoute><CreateXPostPage onCreateXPost={handleCreateXPost} /></ProtectedRoute>} />
          <Route path="/squad" element={<ProtectedRoute><SquadPage players={squadPlayers} onAddPlayer={handleCreateSquadPlayer} onUpdatePlayer={handleUpdateSquadPlayer} onDeletePlayer={handleDeleteSquadPlayer} /></ProtectedRoute>} />
          
          <Route path="/edit/article/:id" element={<ProtectedRoute><EditArticlePage articles={articles} onUpdateArticle={handleUpdateArticle} /></ProtectedRoute>} />
          <Route path="/edit/x-post/:id" element={<ProtectedRoute><EditXPostPage xPosts={xPosts} onUpdateXPost={handleUpdateXPost} /></ProtectedRoute>} />


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