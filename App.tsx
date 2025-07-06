
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

const AppContent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [ratings, setRatings] = useState<Vote[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch votes and ratings
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .select(`*, options:vote_options(*)`)
        .order('created_at', { ascending: false });

      if (voteError) throw voteError;

      const userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');
      const userRatings = JSON.parse(localStorage.getItem('userRatings') || '{}');

      const allVotes: Vote[] = voteData.map((v: any) => ({
        ...v,
        imageUrl: v.image_url,
        userVote: userVotes[v.id],
        userRatings: userRatings[v.id],
      }));
      
      setVotes(allVotes.filter(v => v.type !== VoteKind.RATING));
      setRatings(allVotes.filter(v => v.type === VoteKind.RATING));

      // Fetch quizzes (example of nested fetching)
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select(`*, questions:quiz_questions(*, options:quiz_question_options(*))`)
        .order('created_at', { ascending: false });

      if (quizError) throw quizError;
      
      // Map Supabase response to application types
      const formattedQuizzes: Quiz[] = quizData.map((q: any) => ({
        ...q,
        imageUrl: q.image_url,
        questions: q.questions.map((question: any) => ({
            ...question,
            imageUrl: question.image_url,
            // Assuming correctOptionId from DB is the real ID, but our app uses 1-based index.
            // This part might need adjustment based on the final DB schema for correctOptionId.
            // For now, we'll keep the logic simple.
            correctOptionId: question.correct_option_id_temp, 
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

  const handleVote = useCallback(async (voteId: string, optionId: number) => {
    const vote = votes.find(v => v.id === voteId);
    if (!vote) return;
    
    const option = vote.options.find(o => o.id === optionId);
    if (!option) return;

    // 1. Call Supabase RPC to increment vote count
    const { error } = await supabase.rpc('increment_vote', { option_id_to_inc: option.id });
    
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
            const playerRatingData = playerRatings[option.id];
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
        const { data: vote, error: voteError } = await supabase
            .from('votes')
            .insert({
                title: newVoteData.title,
                description: newVoteData.description,
                type: newVoteData.type,
                end_date: newVoteData.endDate,
                image_url: newVoteData.imageUrl,
                players: newVoteData.players,
            })
            .select()
            .single();

        if (voteError) throw voteError;

        // 2. Insert into 'vote_options' table
        const optionsToInsert = newVoteData.options.map((opt) => ({
            vote_id: vote.id,
            label: opt.label,
        }));
        
        const { error: optionsError } = await supabase.from('vote_options').insert(optionsToInsert);
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
            id: p.id,
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
              id: qIndex + 1,
              options: q.options.map((o, oIndex) => ({
                  ...o,
                  id: oIndex + 1,
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
      <AppContent />
    </ToastProvider>
  );
};


export default App;
