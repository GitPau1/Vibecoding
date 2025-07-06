


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

export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'players'> {
  options: {label: string}[];
}

const SupabaseErrorComponent: React.FC = () => (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center p-8 bg-white shadow-lg rounded-xl max-w-lg border-t-4 border-red-500">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Supabase 설정 오류</h2>
      <p className="text-gray-700 mb-4">
        Supabase 클라이언트를 초기화할 수 없습니다. Vercel 또는 로컬 환경에 환경 변수가 올바르게 설정되었는지 확인하세요.
      </p>
      <p className="text-gray-600 text-left">
        이 프로젝트는 Vite를 사용하므로 환경 변수는 <code>VITE_</code> 접두사를 사용해야 합니다. 프로젝트 루트에 <code>.env</code> 파일을 생성하고 다음 내용을 추가하세요:
      </p>
      <pre className="my-4 p-4 bg-gray-100 rounded-md text-left text-sm text-gray-800 overflow-x-auto">
        <code>
          VITE_SUPABASE_URL=YOUR_SUPABASE_URL<br />
          VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        </code>
      </pre>
      <p className="text-sm text-gray-500 text-left">
        <code>YOUR_SUPABASE_URL</code>과 <code>YOUR_SUPABASE_ANON_KEY</code>를 Supabase 프로젝트의 값으로 교체해주세요. <strong>Vercel에 배포할 때는 Vercel 프로젝트 설정의 환경 변수에도 동일하게 <code>VITE_</code> 접두사를 사용하여 이 변수들을 추가해야 합니다.</strong>
      </p>
      <p className="text-sm text-gray-500 text-left mt-2">
         환경 변수를 설정한 후에는 로컬 서버를 다시 시작하거나 Vercel 배포를 다시 트리거해야 합니다.
      </p>
    </div>
  </div>
);


const AppContent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [ratings, setRatings] = useState<Vote[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fetchAllData = useCallback(async () => {
    // supabase is guaranteed non-null here
    try {
      setLoading(true);
      
      // Fetch votes and ratings
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
        players: v.players,
        options: v.options.map((o: any) => ({
          id: o.id,
          label: o.label,
          votes: o.votes,
          ratingCount: o.rating_count,
          comments: o.comments,
        })),
        userVote: userVotes[v.id],
        userRatings: userRatings[v.id],
      }));
      
      setVotes(allVotes.filter(v => v.type !== VoteKind.RATING));
      setRatings(allVotes.filter(v => v.type === VoteKind.RATING));

      // Fetch quizzes (example of nested fetching)
      const { data: quizData, error: quizError } = await supabase!
        .from('quizzes')
        .select(`*, questions:quiz_questions(*, options:quiz_question_options(*))`)
        .order('created_at', { ascending: false });

      if (quizError) throw quizError;
      
      // Map Supabase response to application types
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
      addToast(`Error fetching data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  
  useEffect(() => {
    fetchAllData();
    window.scrollTo(0, 0);
  }, [location.pathname, fetchAllData]);

  const handleVote = useCallback(async (voteId: string, optionId: string) => {
    const vote = votes.find(v => v.id === voteId);
    if (!vote) return;
    
    const option = vote.options.find(o => o.id === optionId);
    if (!option) return;

    // 1. Call Supabase RPC to increment vote count
    const { error } = await supabase!.rpc('increment_vote', { option_id_to_inc: option.id });
    
    if (error) {
        addToast(`투표 처리 중 오류가 발생했습니다: ${error.message}`, 'error');
        return;
    }

    // 2. Update local state for immediate UI feedback
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

    // 3. Persist user's vote in localStorage
    const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
    userVotes[voteId] = optionId;
    localStorage.setItem('userVotes', JSON.stringify(userVotes));
  }, [votes, addToast]);
  
  const handlePlayerRatingSubmit = useCallback((ratingId: string, playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
    // This is a local-only implementation for now.
    // TODO: To implement with Supabase, you would need an RPC function or a series of updates:
    // 1. For each player in playerRatings:
    //    a. Find the corresponding vote_option.
    //    b. Update its 'votes' (total rating points) and 'rating_count'.
    //    c. Append the new comment to the 'comments' JSONB array.
    // 2. Persist the user's rating in localStorage.
    setRatings(prevRatings =>
      prevRatings.map(rating => {
        if (rating.id === ratingId) {
          const newOptions = rating.options.map(option => {
            const playerRatingData = playerRatings[option.id as any]; // player.id is number, option.id is string from db. Local-only logic has mismatch.
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
  }, [addToast]);

  const handleCreateVote = useCallback(async (newVoteData: VoteCreationData) => {
    try {
        // 1. Insert into 'votes' table
        const { data: vote, error: voteError } = await supabase!
            .from('votes')
            .insert({
                title: newVoteData.title,
                description: newVoteData.description ?? null,
                type: newVoteData.type,
                end_date: newVoteData.endDate,
                image_url: newVoteData.imageUrl ?? null,
                players: newVoteData.players ?? null,
            } as any)
            .select()
            .single();

        if (voteError) throw voteError;
        if (!vote) {
            throw new Error("Vote creation failed, no data returned.");
        }

        // 2. Insert into 'vote_options' table
        const optionsToInsert = newVoteData.options.map((opt) => ({
            vote_id: vote.id,
            label: opt.label,
        }));
        
        const { error: optionsError } = await supabase!.from('vote_options').insert(optionsToInsert as any);
        if (optionsError) throw optionsError;

        addToast('투표가 성공적으로 생성되었습니다.', 'success');
        await fetchAllData(); // Refresh data
        navigate('/');

    } catch (error: any) {
        console.error("Error creating vote:", error);
        addToast(`투표 생성 실패: ${error.message}`, 'error');
    }
  }, [navigate, addToast, fetchAllData]);

  const handleCreateRating = useCallback((newRatingData: VoteCreationData) => {
    // This is a local-only implementation for now.
    // TODO: Implement with Supabase (similar to handleCreateVote, but with type=RATING and players in JSONB)
    const ratingToAdd: Vote = {
        ...newRatingData,
        id: String(Date.now()),
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
    addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');
  }, [navigate, addToast]);


  const handleCreateQuiz = useCallback((newQuizData: Omit<Quiz, 'id' | 'questions'> & { questions: NewQuizQuestion[] }) => {
      // This is a local-only implementation for now.
      // TODO: Implement with Supabase. This requires a chain of inserts:
      // 1. Insert into 'quizzes' table, get back quiz_id.
      // 2. For each question, insert into 'quiz_questions' with quiz_id, get back question_id.
      // 3. For each option, insert into 'quiz_question_options' with question_id.
      // 4. Update 'quiz_questions' with the correct option ID.
      const newQuiz: Quiz = {
          ...newQuizData,
          id: `q${Date.now()}`,
          questions: newQuizData.questions.map((q, qIndex) => ({
              ...q,
              id: String(qIndex + 1),
              options: q.options.map((o, oIndex) => ({
                  ...o,
                  id: String(oIndex + 1),
              }))
          }))
      };
      setQuizzes(prevQuizzes => [newQuiz, ...prevQuizzes]);
      navigate('/');
      addToast('퀴즈가 성공적으로 생성되었습니다.', 'success');
  }, [navigate, addToast]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6">
        <Routes>
            <Route path="/" element={<HomePage votes={votes} ratings={ratings} quizzes={quizzes} loading={loading} />} />
            <Route path="/vote/:id" element={<VotePage votes={votes} onVote={handleVote} onRatePlayers={() => {}} />} />
            <Route path="/rating/:id" element={<VotePage ratings={ratings} onVote={() => {}} onRatePlayers={handlePlayerRatingSubmit} />} />
            <Route path="/quiz/:id" element={<QuizPage quizzes={quizzes} />} />
            <Route path="/create" element={<CreateHubPage />} />
            <Route path="/create/vote" element={<CreateVotePage onCreateVote={handleCreateVote} />} />
            <Route path="/create/rating" element={<CreateRatingPage onCreateRating={handleCreateRating} />} />
            <Route path="/create/quiz" element={<CreateQuizPage onCreateQuiz={handleCreateQuiz} />} />
        </Routes>
      </main>
      <footer className="text-center p-6 text-sm text-gray-400">
        © 2024 SoccerVote. All rights reserved.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      {supabase ? <AppContent /> : <SupabaseErrorComponent />}
    </ToastProvider>
  );
};


export default App;