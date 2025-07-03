
import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Vote, Quiz, NewQuizQuestion } from './types';
import { INITIAL_VOTES, INITIAL_QUIZZES, INITIAL_RATINGS } from './constants';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VotePage from './components/VotePage';
import CreateVotePage from './components/CreateVotePage';
import CreateHubPage from './components/CreateHubPage';
import CreateQuizPage from './components/CreateQuizPage';
import CreateRatingPage from './components/CreateRatingPage';
import QuizPage from './components/QuizPage';
import { ToastProvider, useToast } from './contexts/ToastContext';

export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'players'> {
  options: {label: string}[];
}


const AppContent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>(INITIAL_VOTES);
  const [ratings, setRatings] = useState<Vote[]>(INITIAL_RATINGS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleVote = useCallback((voteId: string, optionId: number) => {
    setVotes(prevVotes =>
      prevVotes.map(vote => {
        if (vote.id === voteId) {
          const newOptions = vote.options.map(option =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          );
          return { ...vote, options: newOptions, userVote: optionId };
        }
        return vote;
      })
    );
  }, []);
  
  const handlePlayerRatingSubmit = useCallback((ratingId: string, playerRatings: { [playerId: number]: { rating: number; comment: string | null; }; }) => {
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
          return { ...rating, options: newOptions, userRatings: playerRatings };
        }
        return rating;
      })
    );
    addToast('평점이 제출되었습니다. 감사합니다!', 'success');
  }, [addToast]);

  const handleCreateVote = useCallback((newVoteData: VoteCreationData) => {
    const voteToAdd: Vote = {
      ...newVoteData,
      id: String(Date.now()),
      options: newVoteData.options.map((opt, index) => ({ id: index + 1, label: opt.label, votes: 0 })),
    };
    setVotes(prevVotes => [voteToAdd, ...prevVotes]);
    navigate('/');
    addToast('투표가 성공적으로 생성되었습니다.', 'success');
  }, [navigate, addToast]);

  const handleCreateRating = useCallback((newRatingData: VoteCreationData) => {
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
            <Route path="/" element={<HomePage votes={votes} ratings={ratings} quizzes={quizzes} />} />
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
