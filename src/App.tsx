import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MatchingPage from './MatchingPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MatchingPage />} />
        <Route path="/course/:id" element={<div>Course Details (To be implemented)</div>} />
      </Routes>
    </Router>
  );
};

export default App;