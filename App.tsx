
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Vote, Quiz, NewQuizQuestion, VoteKind, Player, VoteOption } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VotePage from './components/VotePage';
import CreateVotePage from './components/CreateVotePage';
import CreateHubPage from './components/CreateHubPage';
import CreateQuizPage from './components/CreateQuizPage';
import CreateRatingPage from './components/CreateRatingPage';
import QuizPage from './components/QuizPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { supabase } from './lib/supabaseClient';
import { MOCK_VOTES, MOCK_RATINGS, MOCK_QUIZZES } from './constants';
import { BugIcon } from './components/icons/BugIcon';
import BugReportPage from './components/BugReportPage';

export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'players'> {
  options: {label: string}[];
}

const AppContent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [ratings, setRatings] = useState<Vote[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  
  const isLocalMode = supabase === null;

  const fetchAllData = useCallback(async () => {
    if (isLocalMode) return;
    try {
      setLoading(true);
      
      const { data: voteData, error: voteError } = await supabase!
        .from('votes')
        .select(`
          id, title, description, type, image_url, end_date, players,
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

      const { data: quizData, error: quizError } = await supabase!
        .from('quizzes')
        .select(`*, questions:quiz_questions(*, options:quiz_question_options(*))`)
        .order('created_at', { ascending: false });

      if (quizError) throw quizError;
      
      const formattedQuizzes: Quiz[] = quizData.map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        imageUrl: q.image_url,
        questions: q.questions.map((question: any) => ({
            id: question.id,
            text: question.text,
            imageUrl: question.image_url,
            correctOptionId: question.correct_option_id_temp,
            options: question.options.map((opt: any) => ({
              id: opt.id,
              text: opt.text,
            })),
        }))
      }));
      setQuizzes(formattedQuizzes);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      addToast(`데이터 로딩 오류: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, isLocalMode]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (isLocalMode) {
      setLoading(true);
      // Deep copy to prevent mutation of constant data
      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');

      setVotes(JSON.parse(JSON.stringify(MOCK_VOTES)).map((v: Vote) => ({ ...v, userVote: userVotes[v.id] })));
      setRatings(JSON.parse(JSON.stringify(MOCK_RATINGS)).map((r: Vote) => ({ ...r, userRatings: userRatings[r.id] })));
      setQuizzes(JSON.parse(JSON.stringify(MOCK_QUIZZES)));
      setLoading(false);
    } else {
      fetchAllData();
    }
  }, [isLocalMode, location.pathname, fetchAllData]);

  useEffect(() => {
    if (isLocalMode) {
      addToast('Supabase 연결 실패. 로컬 모드로 실행됩니다.', 'info');
    }
  }, [isLocalMode, addToast]);

  const handleVote = useCallback(async (voteId: string, optionId: string) => {
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
  }, [votes, addToast, isLocalMode]);
  
  const handlePlayerRatingSubmit = useCallback(async (ratingId: string, playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
    const updateLocalState = () => {
        setRatings(prevRatings =>
            prevRatings.map(rating => {
                if (rating.id === ratingId) {
                    const newOptions = rating.options.map(option => {
                        const playerRatingData = playerRatings[Number(option.id)];
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
    
    // Supabase logic
    try {
        const rating = ratings.find(r => r.id === ratingId);
        if (!rating) throw new Error("Rating not found");

        const updates = Object.entries(playerRatings).map(([playerId, data]) => {
            const option = rating.options.find(o => o.id === playerId);
            if (!option) return null;
            const newComments = data.comment ? [...(option.comments || []), data.comment] : (option.comments || []);

            return supabase!.from('vote_options').update({
                votes: option.votes + data.rating,
                rating_count: (option.ratingCount || 0) + 1,
                comments: newComments
            }).eq('id', option.id);
        }).filter(Boolean);

        const results = await Promise.all(updates);
        const dbError = results.find(res => res && res.error);
        if (dbError && dbError.error) throw dbError.error;

        updateLocalState();
    } catch (error: any) {
        addToast(`평점 제출 실패: ${error.message}`, 'error');
    }
  }, [addToast, ratings, isLocalMode]);

  const handleCreateVote = useCallback(async (newVoteData: VoteCreationData) => {
    if (isLocalMode) {
        const voteToAdd: Vote = {
            ...newVoteData,
            id: `mock-vote-${Date.now()}`,
            options: newVoteData.options.map((o, i) => ({
                id: `mock-opt-${Date.now()}-${i}`,
                label: o.label,
                votes: 0,
            })),
        };
        setVotes(prev => [voteToAdd, ...prev]);
        navigate('/');
        addToast('투표가 성공적으로 생성되었습니다 (로컬).', 'success');
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

        const optionsToInsert = newVoteData.options.map((opt) => ({
            vote_id: vote.id,
            label: opt.label,
        }));
        
        const { error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert);
        if (optionsError) throw optionsError;

        addToast('투표가 성공적으로 생성되었습니다.', 'success');
        await fetchAllData();
        navigate('/');
    } catch (error: any) {
        addToast(`투표 생성 실패: ${error.message}`, 'error');
    }
  }, [navigate, addToast, fetchAllData, isLocalMode]);

  const handleCreateRating = useCallback(async (newRatingData: VoteCreationData) => {
     const createLocalRating = () => {
        const ratingToAdd: Vote = {
            ...newRatingData,
            id: `mock-rating-${Date.now()}`,
            options: newRatingData.players!.map(p => ({
                id: String(p.id),
                label: p.name,
                votes: 0,
                ratingCount: 0,
                comments: [],
            })),
        };
        setRatings(prevRatings => [ratingToAdd, ...prevRatings]);
        navigate('/');
        addToast('선수 평점이 성공적으로 생성되었습니다 (로컬).', 'success');
    };

    if (isLocalMode) {
      createLocalRating();
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

        const optionsToInsert = newRatingData.players!.map(p => ({
            vote_id: vote.id,
            label: p.name,
            id: String(p.id) // Use player ID for option ID in ratings
        }));
        
        const { error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert);
        if (optionsError) throw optionsError;

        addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');
        await fetchAllData();
        navigate('/');
    } catch (error: any) {
        addToast(`평점 생성 실패: ${error.message}`, 'error');
    }
  }, [navigate, addToast, fetchAllData, isLocalMode]);

  const handleCreateQuiz = useCallback(async (newQuizData: Omit<Quiz, 'id' | 'questions'> & { questions: NewQuizQuestion[] }) => {
      const createLocalQuiz = () => {
        const newQuiz: Quiz = {
            ...newQuizData,
            id: `mock-q-${Date.now()}`,
            questions: newQuizData.questions.map((q, qIndex) => ({
                ...q,
                id: `mock-q-q${qIndex + 1}`,
                options: q.options.map((o, oIndex) => ({
                    ...o,
                    id: `mock-q-o${oIndex + 1}`,
                }))
            }))
        };
        setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
        navigate('/');
        addToast('퀴즈가 성공적으로 생성되었습니다 (로컬).', 'success');
      };

      if (isLocalMode) {
        createLocalQuiz();
        return;
      }
      
      try {
        const { data: quiz, error: quizError } = await supabase!.from('quizzes').insert({
            title: newQuizData.title,
            description: newQuizData.description,
            image_url: newQuizData.imageUrl ?? null
        }).select().single();
        if (quizError) throw quizError;
        if (!quiz) throw new Error("Quiz creation failed");

        for (const q of newQuizData.questions) {
            const { data: question, error: questionError } = await supabase!.from('quiz_questions').insert({
                quiz_id: quiz.id,
                text: q.text,
                image_url: q.imageUrl ?? null,
                correct_option_id_temp: q.correctOptionId
            }).select().single();
            if (questionError) throw questionError;
            if (!question) throw new Error("Question creation failed");
            
            const optionsToInsert = q.options.map(opt => ({
                question_id: question.id,
                text: opt.text,
            }));
            const { error: optionsError } = await supabase!.from('quiz_question_options').insert(optionsToInsert);
            if (optionsError) throw optionsError;
        }

        addToast('퀴즈가 성공적으로 생성되었습니다.', 'success');
        await fetchAllData();
        navigate('/');
      } catch (error: any) {
         addToast(`퀴즈 생성 실패: ${error.message}`, 'error');
      }
  }, [navigate, addToast, fetchAllData, isLocalMode]);

  const handleCreateBugReport = useCallback(async ({ title, description, url, screenshotFile }: { title: string; description: string; url: string; screenshotFile: File | null; }) => {
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
  }, [isLocalMode, addToast, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6 pb-24">
        <Routes>
            <Route path="/" element={<HomePage votes={votes} ratings={ratings} quizzes={quizzes} loading={loading} />} />
            <Route path="/vote/:id" element={<VotePage votes={votes} onVote={handleVote} onRatePlayers={() => {}} />} />
            <Route path="/rating/:id" element={<VotePage ratings={ratings} onVote={() => {}} onRatePlayers={handlePlayerRatingSubmit} />} />
            <Route path="/quiz/:id" element={<QuizPage quizzes={quizzes} />} />
            <Route path="/create" element={<CreateHubPage />} />
            <Route path="/create/vote" element={<CreateVotePage onCreateVote={handleCreateVote} />} />
            <Route path="/create/rating" element={<CreateRatingPage onCreateRating={handleCreateRating} />} />
            <Route path="/create/quiz" element={<CreateQuizPage onCreateQuiz={handleCreateQuiz} />} />
            <Route path="/report-bug" element={<BugReportPage onSubmit={handleCreateBugReport} />} />
        </Routes>
      </main>
      <button
        onClick={() => navigate('/report-bug', { state: { from: location.pathname } })}
        className="fixed bottom-6 right-6 bg-[#6366f1] text-white p-4 rounded-full shadow-lg hover:bg-[#4f46e5] transition-transform duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4f46e5] z-20"
        aria-label="Report a bug"
      >
        <BugIcon className="w-6 h-6" />
      </button>
      <footer className="text-center p-6 text-sm text-gray-400">
        © 2024 SoccerVote. All rights reserved.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};


export default App;
