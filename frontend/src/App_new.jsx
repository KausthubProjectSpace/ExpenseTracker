import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from './components/WelcomeScreen';
import TransactionPage from './components/TransactionPage';
import ExportScreen from './components/ExportScreen';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/transaction/:year/:month/:day" element={<TransactionPage />} />
          <Route path="/export" element={<ExportScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
