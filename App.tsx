
import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './components/HomePage';
import VotePage from './components/VotePage';
import CreateVotePage from './components/CreateVotePage';
import CreateHubPage from './components/CreateHubPage';
import CreateQuizPage from './components/CreateQuizPage';
import CreateRatingPage from './components/CreateRatingPage';
import QuizPage from './components/QuizPage';
import { ToastProvider } from './contexts/ToastContext';


const AppContent: React.FC = () => {
  const location = useLocation();

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto max-w-4xl p-4 sm:p-6">
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vote/:id" element={<VotePage />} />
            <Route path="/rating/:id" element={<VotePage />} />
            <Route path="/quiz/:id" element={<QuizPage />} />
            <Route path="/create" element={<CreateHubPage />} />
            <Route path="/create/vote" element={<CreateVotePage />} />
            <Route path="/create/rating" element={<CreateRatingPage />} />
            <Route path="/create/quiz" element={<CreateQuizPage />} />
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