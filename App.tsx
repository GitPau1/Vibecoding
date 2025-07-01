
import React, { useState, useCallback } from 'react';
import { Vote, VoteKind, Quiz, QuizQuestion, QuizQuestionOption, NewQuizQuestion, Player } from './types';
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

type ViewState = {
  page: 'home' | 'vote' | 'quiz' | 'rating' | 'create' | 'createVote' | 'createQuiz' | 'createRating';
  id?: string;
};

export interface VoteCreationData extends Pick<Vote, 'title' | 'description' | 'type' | 'endDate' | 'imageUrl' | 'players'> {
  options: {label: string}[];
}


const AppContent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>(INITIAL_VOTES);
  const [ratings, setRatings] = useState<Vote[]>(INITIAL_RATINGS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [view, setView] = useState<ViewState>({ page: 'home' });
  const { addToast } = useToast();

  const handleNavigate = useCallback((newView: ViewState) => {
    setView(newView);
    window.scrollTo(0, 0);
  }, []);

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
    handleNavigate({ page: 'home' });
    addToast('투표가 성공적으로 생성되었습니다.', 'success');
  }, [handleNavigate, addToast]);

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
    handleNavigate({ page: 'home' });
    addToast('선수 평점이 성공적으로 생성되었습니다.', 'success');
  }, [handleNavigate, addToast]);


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
      handleNavigate({ page: 'home' });
      addToast('퀴즈가 성공적으로 생성되었습니다.', 'success');
  }, [handleNavigate, addToast]);


  const renderContent = () => {
    switch (view.page) {
      case 'create':
        return <CreateHubPage onNavigate={handleNavigate} />;
      case 'createVote':
        return <CreateVotePage onCreateVote={handleCreateVote} onCancel={() => handleNavigate({ page: 'create' })} />;
      case 'createRating':
        return <CreateRatingPage onCreateRating={handleCreateRating} onCancel={() => handleNavigate({ page: 'create' })} />;
      case 'createQuiz':
        return <CreateQuizPage onCreateQuiz={handleCreateQuiz} onCancel={() => handleNavigate({ page: 'create' })} />;
      case 'vote':
        const selectedVote = votes.find(v => v.id === view.id);
        if (selectedVote) {
          return <VotePage vote={selectedVote} onVote={handleVote} onRatePlayers={() => {}}/>;
        }
        handleNavigate({ page: 'home' });
        return null;
       case 'rating':
        const selectedRating = ratings.find(r => r.id === view.id);
        if (selectedRating) {
          return <VotePage vote={selectedRating} onVote={() => {}} onRatePlayers={handlePlayerRatingSubmit}/>;
        }
        handleNavigate({ page: 'home' });
        return null;
      case 'quiz':
        const selectedQuiz = quizzes.find(q => q.id === view.id);
        if (selectedQuiz) {
          return <QuizPage quiz={selectedQuiz} />;
        }
        handleNavigate({ page: 'home' });
        return null;
      case 'home':
      default:
        return <HomePage votes={votes} ratings={ratings} quizzes={quizzes} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header onGoHome={() => handleNavigate({ page: 'home' })} onCreate={() => handleNavigate({ page: 'create' })} />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6">
        {renderContent()}
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