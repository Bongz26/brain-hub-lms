import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchingPage from './MatchingPage';
import SessionBookButton from './SessionBookButton';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MatchingPage />} />
        <Route path="/course/:id" element={<div>Course Details (To be implemented)</div>} />
        <Route path="/test-book/:tutorId" element={<SessionBookButton tutorId="b8254094-2ac7-4ba9-b6e5-968f9d9dc6c9" />} />
      </Routes>
    </Router>
  );
};

export default App;