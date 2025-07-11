

import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Vote, VoteKind, Player, Article, XPost, SquadPlayer, PlayerPosition } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VotePage from './components/VotePage';
import CreateVotePage from './components/CreateVotePage';
import CreateHubPage from './components/CreateHubPage';
import CreateRatingPage from './components/CreateRatingPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { supabase, Database } from './lib/supabaseClient';
import { MOCK_VOTES, MOCK_RATINGS, MOCK_ARTICLES, MOCK_X_POSTS, MOCK_SQUAD_PLAYERS } from './constants';
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


export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'players'> {
  options: {label: string}[];
}

export type ArticleCreationData = Omit<Article, 'id' | 'createdAt' | 'recommendations' | 'userRecommended' | 'views'>;
export type XPostCreationData = Omit<XPost, 'id' | 'createdAt'>;

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
  const [ratings, setRatings] = useState<Vote[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [xPosts, setXPosts] = useState<XPost[]>([]);
  const [squadPlayers, setSquadPlayers] = useState<SquadPlayer[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { session, authLoading } = useAuth();
  
  const isLocalMode = supabase === null;

  const fetchAllData = useCallback(async () => {
    if (isLocalMode) return;
    try {
      const userId = session?.user?.id;

      // Parallel fetch for all content and user data
      const [
        voteRes, 
        articleRes, 
        xPostRes, 
        squadRes, 
        userVoteRes, 
        userRatingRes, 
        userRecRes
      ] = await Promise.all([
        supabase.from('votes').select(`*, options:vote_options(*)`).order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('x_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('squad_players').select('*').order('number', { ascending: true }),
        userId ? supabase.from('user_votes').select('vote_id, option_id').eq('user_id', userId) : Promise.resolve({ data: [] }),
        userId ? supabase.from('user_ratings').select('rating_id, option_id, rating, comment').eq('user_id', userId) : Promise.resolve({ data: [] }),
        userId ? supabase.from('user_article_recommendations').select('article_id').eq('user_id', userId) : Promise.resolve({ data: [] })
      ]);
      
      // Process user data into maps for efficient lookup
      const userVotesMap = userVoteRes.data?.reduce((acc, v) => ({ ...acc, [v.vote_id]: v.option_id }), {}) || {};
      const userRatingsMap = userRatingRes.data?.reduce((acc, r) => {
        if (!acc[r.rating_id]) acc[r.rating_id] = {};
        const vote = voteRes.data?.find(v => v.id === r.rating_id);
        if (!vote) return acc;
        const option = vote.options.find((o: any) => o.id === r.option_id);
        if (!option) return acc;
        const player = (vote.players as Player[] | null)?.find(p => p.name === option.label);
        
        if (player) {
          acc[r.rating_id][player.id] = { rating: r.rating, comment: r.comment };
        }
        return acc;
      }, {} as { [key: string]: { [key: number]: { rating: number; comment: string | null } } }) || {};
      const userRecsMap = userRecRes.data?.reduce((acc, r) => ({ ...acc, [r.article_id]: true }), {}) || {};

      // Process votes and ratings
      const allVotes: Vote[] = voteRes.data!.map((v: any) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        type: v.type,
        endDate: v.end_date,
        createdAt: v.created_at,
        imageUrl: v.image_url,
        players: v.players as Player[] | null,
        options: v.options.map((o: any) => ({
          id: o.id,
          label: o.label,
          votes: o.votes,
          ratingCount: o.rating_count,
          comments: o.comments as string[] | undefined,
        })),
        userVote: userVotesMap[v.id],
        userRatings: userRatingsMap[v.id],
      }));
      setVotes(allVotes.filter(v => v.type !== VoteKind.RATING));
      setRatings(allVotes.filter(v => v.type === VoteKind.RATING));
      
      // Process articles
      setArticles(articleRes.data!.map((a: any) => ({
        ...a,
        imageUrl: a.image_url,
        userRecommended: !!userRecsMap[a.id]
      })));

      // Process other data
      setXPosts(xPostRes.data!.map((p: any) => ({ ...p, postUrl: p.post_url })));
      setSquadPlayers(squadRes.data!.map((p: any) => ({ ...p, photoUrl: p.photo_url })));

    } catch (error: any) {
      console.error('Error fetching data:', error);
      addToast(`데이터 로딩 오류: ${error.message}`, 'error');
    } finally {
      setDataLoading(false);
    }
  }, [isLocalMode, session, addToast]);
  
  // Data loading effect
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    if (isLocalMode) {
      setVotes(MOCK_VOTES);
      setRatings(MOCK_RATINGS);
      setArticles(MOCK_ARTICLES);
      setXPosts(MOCK_X_POSTS);
      setSquadPlayers(MOCK_SQUAD_PLAYERS);
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
    if (!session) {
      addToast('로그인이 필요한 기능입니다.', 'info');
      return;
    }
    
    // Optimistic update
    setVotes(prevVotes =>
      prevVotes.map(v => {
        if (v.id === voteId) {
          return { ...v, userVote: optionId }; // Show results immediately
        }
        return v;
      })
    );
    
    if (isLocalMode) return;
    
    const { error } = await supabase.rpc('handle_vote', { target_option_id: optionId });
    if (error) {
      addToast(`투표 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
      fetchAllData(); // Revert optimistic update on error
    } else {
      fetchAllData(); // Refetch to get accurate vote counts
    }
  };
  
  const handlePlayerRatingSubmit = async (ratingId: string, playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
    if (!session) {
        addToast('로그인이 필요한 기능입니다.', 'info');
        return;
    }

    const rating = ratings.find(r => r.id === ratingId);
    if (!rating || !rating.players) {
        addToast('평가 대상을 찾을 수 없습니다.', 'error');
        return;
    }
    
    // Optimistic update
    setRatings(prevRatings =>
        prevRatings.map(r => 
            r.id === ratingId ? { ...r, userRatings: playerRatings } : r
        )
    );

    if (isLocalMode) {
        addToast('평점이 제출되었습니다. 감사합니다!', 'success');
        return;
    }
    
    const ratingsToInsert = Object.entries(playerRatings).map(([playerIdStr, data]) => {
        const player = rating.players!.find(p => p.id === Number(playerIdStr));
        const option = rating.options.find(o => o.label === player?.name);
        if (!option) return null;
        
        return {
            user_id: session.user.id,
            rating_id: ratingId,
            option_id: option.id,
            rating: data.rating,
            comment: data.comment
        };
    }).filter((r): r is NonNullable<typeof r> => !!r);

    if (ratingsToInsert.length !== rating.players.length) {
        addToast('평점 데이터를 처리하는 중 오류가 발생했습니다.', 'error');
        fetchAllData(); // Revert
        return;
    }
    
    const { error } = await supabase.from('user_ratings').insert(ratingsToInsert);

    if (error) {
        addToast(`평점 제출 실패: ${error.message}`, 'error');
        fetchAllData(); // Revert
    } else {
        addToast('평점이 제출되었습니다. 감사합니다!', 'success');
        fetchAllData(); // Refetch to get new aggregates
    }
  };

  const handleCreateVote = async (newVoteData: VoteCreationData) => {
    // ... creation logic is already protected by ProtectedRoute, so it's fine
    if (isLocalMode) {
        const voteToAdd: Vote = {
            ...newVoteData,
            id: `mock-vote-${Date.now()}`,
            createdAt: new Date().toISOString(),
            options: newVoteData.options.map((o, i) => ({ id: `new-opt-${i}`, label: o.label, votes: 0 })),
        };
        setVotes((prev: Vote[]) => [voteToAdd, ...prev]);
        navigate('/');
        addToast('투표가 성공적으로 생성되었습니다.', 'success');
        return;
    }

    try {
        const { data: vote, error: voteError } = await supabase.from('votes').insert({
                title: newVoteData.title,
                description: newVoteData.description ?? null,
                type: newVoteData.type,
                end_date: newVoteData.endDate,
                image_url: newVoteData.imageUrl ?? null,
                players: newVoteData.players ?? null,
            }).select().single();

        if (voteError) throw voteError;

        const optionsToInsert = newVoteData.options.map((opt) => ({ vote_id: vote.id, label: opt.label }));
        const { error: optionsError } = await supabase.from('vote_options').insert(optionsToInsert);
        if (optionsError) throw optionsError;
        
        await fetchAllData();
        navigate('/');
        addToast('투표가 성공적으로 생성되었습니다.', 'success');
    } catch (error: any) {
        addToast(`투표 생성 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateRating = async (newRatingData: VoteCreationData) => {
    // ... creation logic is fine
     if (isLocalMode) {
        const ratingToAdd: Vote = {
            ...newRatingData,
            id: `mock-rating-${Date.now()}`,
            createdAt: new Date().toISOString(),
            options: newRatingData.players!.map(p => ({ id: String(p.id), label: p.name, votes: 0, ratingCount: 0, comments: [] })),
        };
        setRatings(prev => [ratingToAdd, ...prev]);
        navigate('/');
        addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');
        return;
    }

    try {
        const { data: vote, error: voteError } = await supabase.from('votes').insert({
            title: newRatingData.title,
            description: newRatingData.description ?? null,
            type: VoteKind.RATING,
            end_date: newRatingData.endDate,
            players: newRatingData.players ?? null,
        }).select().single();

        if (voteError) throw voteError;

        const optionsToInsert = newRatingData.players!.map(p => ({ vote_id: vote.id, label: p.name }));
        const { error: optionsError } = await supabase.from('vote_options').insert(optionsToInsert);
        if (optionsError) throw optionsError;

        await fetchAllData();
        navigate('/');
        addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');

    } catch (error: any) {
        addToast(`평점 생성 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateArticle = async (newArticleData: ArticleCreationData) => {
    // ... creation logic is fine
    if (isLocalMode) {
      const articleToAdd: Article = { ...newArticleData, id: `mock-article-${Date.now()}`, createdAt: new Date().toISOString(), recommendations: 0, views: 0, userRecommended: false };
      setArticles(prev => [articleToAdd, ...prev]);
      navigate('/');
      addToast('아티클이 성공적으로 생성되었습니다.', 'success');
      return;
    }

    try {
      const { error } = await supabase.from('articles').insert({ title: newArticleData.title, body: newArticleData.body, image_url: newArticleData.imageUrl ?? null });
      if (error) throw error;
      await fetchAllData();
      navigate('/');
      addToast('아티클이 성공적으로 생성되었습니다.', 'success');
    } catch (error: any) {
      addToast(`아티클 생성 실패: ${error.message}`, 'error');
    }
  };

  const handleRecommendArticle = async (articleId: string) => {
    if (!session) {
      addToast('로그인이 필요한 기능입니다.', 'info');
      return;
    }

    // Optimistic update
    setArticles(prev => prev.map(a =>
      a.id === articleId ? { ...a, recommendations: a.recommendations + 1, userRecommended: true } : a
    ));
    
    if (isLocalMode) return;
    
    const { error } = await supabase.rpc('handle_recommendation', { target_article_id: articleId });
    if (error) {
      addToast(`추천 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
      fetchAllData(); // Revert
    }
  };

  const handleViewArticle = async (articleId: string) => {
    const viewedArticles = JSON.parse(sessionStorage.getItem('viewedArticles') || '{}');
    if (viewedArticles[articleId]) return;

    if (isLocalMode) {
      setArticles(prev => prev.map(a => a.id === articleId ? { ...a, views: (a.views || 0) + 1 } : a));
      viewedArticles[articleId] = true;
      sessionStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
      return;
    }

    const { error } = await supabase.rpc('increment_article_view', { article_id_to_inc: articleId });
    if (!error) {
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, views: (a.views || 0) + 1 } : a));
        viewedArticles[articleId] = true;
        sessionStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
    }
  };

  const handleCreateXPost = async (newXPostData: XPostCreationData) => {
    // ... creation logic is fine
    if (isLocalMode) {
      const postToAdd: XPost = { ...newXPostData, id: `mock-x-post-${Date.now()}`, createdAt: new Date().toISOString() };
      setXPosts((prev: XPost[]) => [postToAdd, ...prev]);
      navigate('/');
      addToast('최신 소식이 성공적으로 등록되었습니다.', 'success');
      return;
    }
    try {
      const { error } = await supabase.from('x_posts').insert({ description: newXPostData.description, post_url: newXPostData.postUrl });
      if (error) throw error;
      await fetchAllData();
      navigate('/');
      addToast('최신 소식이 성공적으로 등록되었습니다.', 'success');
    } catch (error: any) {
      addToast(`소식 등록 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateBugReport = async ({ title, description, url, screenshotFile }: { title: string; description: string; url: string; screenshotFile: File | null; }) => {
    if (isLocalMode) {
      addToast('로컬 모드에서는 오류 제보를 할 수 없습니다.', 'error');
      return;
    }
    // ... This is fine as it's an anonymous action
    try {
      let screenshot_url: string | null = null;
      if (screenshotFile) {
        const filePath = `public/${Date.now()}-${screenshotFile.name}`;
        const { error: uploadError } = await supabase.storage.from('bug_screenshots').upload(filePath, screenshotFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('bug_screenshots').getPublicUrl(filePath);
        screenshot_url = urlData.publicUrl;
      }
      const { error: insertError } = await supabase.from('bug_reports').insert({ title, description, url, screenshot_url });
      if (insertError) throw insertError;
      addToast('오류 제보가 성공적으로 제출되었습니다. 감사합니다!', 'success');
      navigate('/');
    } catch (error: any) {
      addToast(`오류 제보 제출 실패: ${error.message}`, 'error');
    }
  };

  // Squad handlers are already protected by ProtectedRoute, so they are fine.
  const handleCreateSquadPlayer = async (playerData: SquadPlayerCreationData) => {
    if (isLocalMode) {
      const newPlayer: SquadPlayer = { ...playerData, id: `sq-player-${Date.now()}`, createdAt: new Date().toISOString() };
      setSquadPlayers(prev => [...prev, newPlayer].sort((a,b) => a.number - b.number));
      addToast('선수가 추가되었습니다.', 'success');
      return;
    }
    try {
      const { error } = await supabase.from('squad_players').insert({ name: playerData.name, number: playerData.number, position: playerData.position, photo_url: playerData.photoUrl ?? null });
      if (error) throw error;
      await fetchAllData();
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
      const { error } = await supabase.from('squad_players').update({ name: playerData.name, number: playerData.number, position: playerData.position, photo_url: playerData.photoUrl ?? null }).eq('id', playerId);
      if (error) throw error;
      await fetchAllData();
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
      const { error } = await supabase.from('squad_players').delete().eq('id', playerId);
      if (error) throw error;
      await fetchAllData();
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
          <Route path="/" element={<HomePage votes={votes} ratings={ratings} articles={articles} xPosts={xPosts} />} />
          <Route path="/vote/:id" element={<VotePage votes={votes} onVote={handleVote} onRatePlayers={() => {}} />} />
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
          <Route path="/create/rating" element={<ProtectedRoute><CreateRatingPage onCreateRating={handleCreateRating} squadPlayers={squadPlayers} /></ProtectedRoute>} />
          <Route path="/create/article" element={<ProtectedRoute><CreateArticlePage onCreateArticle={handleCreateArticle} /></ProtectedRoute>} />
          <Route path="/create/x-post" element={<ProtectedRoute><CreateXPostPage onCreateXPost={handleCreateXPost} /></ProtectedRoute>} />
          <Route path="/squad" element={<ProtectedRoute><SquadPage players={squadPlayers} onAddPlayer={handleCreateSquadPlayer} onUpdatePlayer={handleUpdateSquadPlayer} onDeletePlayer={handleDeleteSquadPlayer} /></ProtectedRoute>} />

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
