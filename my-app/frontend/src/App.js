import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import WelcomePage from './Pages/WelcomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LoginPage/>} />
        <Route exact path="/welcome" element={<WelcomePage/>} />
      </Routes>
    </Router>
  );
}

export default App;