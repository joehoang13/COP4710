import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import WelcomePage from './Pages/WelcomePage';
import { LoadScript } from '@react-google-maps/api';
import ViewEventsPage from './Pages/ViewEventsPage/ViewEventsPage';

const googleAPIKey = 'AIzaSyCoMhFmp0p1scXluoy64omIumZkFswmCAc';

function App() {
  return (
    <LoadScript googleMapsApiKey={googleAPIKey} libraries={['places']}>
      <Router>
        <Routes>
          <Route exact path="/" element={<LoginPage/>} />
          <Route exact path="/welcome" element={<WelcomePage/>} />
          <Route exact path="/view-events" element={<ViewEventsPage/>} />
        </Routes>
      </Router>
    </LoadScript>
  );
}

export default App;