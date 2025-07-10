

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
import { LoginPage } from './components/LoginPage';
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
  const { authLoading } = useAuth();
  
  const isLocalMode = supabase === null;

  const fetchAllData = useCallback(async () => {
    if (isLocalMode) return;
    try {
      // Fetch votes and ratings
      const { data: voteData, error: voteError } = await supabase!
        .from('votes')
        .select(`
          id, title, description, type, image_url, end_date, created_at, players,
          options:vote_options(id, label, votes, rating_count, comments)
        `)
        .order('created_at', { ascending: false });
      if (voteError) throw voteError;

      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');

      const allVotes: Vote[] = voteData.map((v: any) => ({
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
        userVote: userVotes[v.id],
        userRatings: userRatings[v.id],
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
        postUrl: p.post_url
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
      const userRecommendedArticles = JSON.parse(localStorage.getItem('userRecommendedArticles') || '{}');

      setVotes(JSON.parse(JSON.stringify(MOCK_VOTES)).map((v: Vote) => ({ ...v, userVote: userVotes[v.id] })));
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
  
  const handlePlayerRatingSubmit = async (ratingId: string, playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
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

        updateLocalState();
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
        const { data: vote, error: voteError } = await supabase!
            .from('votes')
            .insert({
                title: newVoteData.title,
                description: newVoteData.description ?? null,
                type: newVoteData.type,
                end_date: newVoteData.endDate,
                image_url: newVoteData.imageUrl ?? null,
                players: newVoteData.players ?? null,
            }).select().single();

        if (voteError) throw voteError;
        if (!vote) throw new Error("Vote creation failed, no data returned.");

        type VoteOptionInsert = Database['public']['Tables']['vote_options']['Insert'];
        const optionsToInsert: VoteOptionInsert[] = newVoteData.options.map((opt) => ({
            vote_id: vote.id,
            label: opt.label,
        }));
        
        const { data: insertedOptions, error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert).select();
        if (optionsError) throw optionsError;
        if (!insertedOptions) throw new Error("Could not retrieve created options.");
        
        const newVoteWithDetails: Vote = {
            id: vote.id,
            createdAt: vote.created_at,
            title: newVoteData.title,
            description: newVoteData.description,
            type: newVoteData.type,
            endDate: newVoteData.endDate,
            imageUrl: newVoteData.imageUrl,
            players: newVoteData.players,
            options: insertedOptions.map(o => ({
                id: o.id,
                label: o.label,
                votes: 0,
            })),
        };
        commonLogic(newVoteWithDetails);
    } catch (error: any) {
        addToast(`투표 생성 실패: ${error.message}`, 'error');
    }
  };

  const handleCreateRating = async (newRatingData: VoteCreationData) => {
     const commonLogic = (newRating: Vote) => {
        setRatings(prev => [newRating, ...prev]);
        navigate('/');
        addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');
    };

    if (isLocalMode) {
        const ratingToAdd: Vote = {
            ...newRatingData,
            id: `mock-rating-${Date.now()}`,
            createdAt: new Date().toISOString(),
            options: newRatingData.players!.map(p => ({
                id: String(p.id),
                label: p.name,
                votes: 0,
                ratingCount: 0,
                comments: [],
            })),
        };
        commonLogic(ratingToAdd);
        return;
    }

    try {
        const { data: vote, error: voteError } = await supabase!.from('votes').insert({
            title: newRatingData.title,
            description: newRatingData.description ?? null,
            type: VoteKind.RATING,
            end_date: newRatingData.endDate,
            players: newRatingData.players ?? null,
        }).select().single();

        if (voteError) throw voteError;
        if (!vote) throw new Error("Rating creation failed");

        type VoteOptionInsert = Database['public']['Tables']['vote_options']['Insert'];
        const optionsToInsert: VoteOptionInsert[] = newRatingData.players!.map(p => ({
            vote_id: vote.id,
            label: p.name,
        }));
        
        const { data: insertedOptions, error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert).select();
        if (optionsError) throw optionsError;
        if (!insertedOptions) throw new Error("Failed to get created options back");

        const newRatingWithDetails: Vote = {
            id: vote.id,
            createdAt: vote.created_at,
            title: newRatingData.title,
            description: newRatingData.description,
            type: newRatingData.type,
            endDate: newRatingData.endDate,
            imageUrl: newRatingData.imageUrl,
            players: newRatingData.players,
            options: insertedOptions.map(o => ({
                id: o.id,
                label: o.label,
                votes: o.votes,
                ratingCount: o.rating_count || 0,
                comments: o.comments || [],
            })),
        };
        commonLogic(newRatingWithDetails);

    } catch (error: any) {
        addToast(`평점 생성 실패: ${error.message}`, 'error');
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
      };
      commonLogic(articleToAdd);
      return;
    }

    try {
      const { data, error } = await supabase!.from('articles').insert({
        title: newArticleData.title,
        body: newArticleData.body,
        image_url: newArticleData.imageUrl ?? null
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
        userRecommended: false
      };

      commonLogic(newArticle);
    } catch (error: any) {
      addToast(`아티클 생성 실패: ${error.message}`, 'error');
    }

  };

  const handleRecommendArticle = async (articleId: string) => {
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
      };
      commonLogic(postToAdd);
      return;
    }

    try {
      const { data, error } = await supabase!.from('x_posts').insert({
        description: newXPostData.description,
        post_url: newXPostData.postUrl
      }).select().single();

      if (error) throw error;
      
      const newPost: XPost = {
        id: data.id,
        createdAt: data.created_at,
        description: data.description,
        postUrl: data.post_url,
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