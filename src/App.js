import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import HomePage from './components/HomePage';
import UserProfile from './components/UserProfile';
import BlogsSection from './components/BlogsSection';
import FriendManagement from './components/FriendManagement';
import GameInformation from './components/GameInformation';
import GameRanking from './components/GameRanking';
import NavigationBar from './components/NavigationBar';
import SignIn from './components/SignIn.js';
import client from './apollo.js';

function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogsSection />} />
          <Route path="/friends" element={<FriendManagement />} />
          <Route path="/gameinfo" element={<GameInformation />} />
          <Route path="/gamerankings" element={<GameRanking />} />
          <Route path="/navigation" element={<NavigationBar />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </Router>
    </ApolloProvider>
  );
}

export default App;
