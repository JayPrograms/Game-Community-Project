//Needs work, currently has mock data

import React, { useState, useEffect } from 'react';

const HomePage = () => {
  const [friendsOnline, setFriendsOnline] = useState([]);

  const [topRatedBlogPosts, setTopRatedBlogPosts] = useState([]);

  const [topGames, setTopGames] = useState([]);

useEffect(() => {
    const simulatedFriendsOnline = [
      { id: 1, username: 'friend1', status: 'online' },
      { id: 2, username: 'friend2', status: 'online' },
      { id: 3, username: 'friend3', status: 'offline' },
      { id: 4, username: 'friend4', status: 'online' },
      { id: 5, username: 'friend5', status: 'offline' },
    ];
  
    setFriendsOnline(simulatedFriendsOnline);
  }, []);

  useEffect(() => {
    const simulatedTopRatedBlogPosts = [
      { id: 1, title: 'The Art of Gaming', author: 'user1', rating: 4.5 },
      { id: 2, title: 'Exploring New Horizons in Gaming', author: 'user2', rating: 4.8 },
      { id: 3, title: 'Game Review: Legendary Adventure', author: 'user3', rating: 5.0 },
      { id: 4, title: 'Tips for Beginners: Level Up Fast!', author: 'user4', rating: 4.2 },
      { id: 5, title: 'Gaming Community Highlights', author: 'user5', rating: 4.9 },
    ];
  
    const sortedPosts = simulatedTopRatedBlogPosts.sort((a, b) => b.rating - a.rating);
  
    setTopRatedBlogPosts(sortedPosts);
  }, []);
  
  useEffect(() => {
    const simulatedTopGames = [
      { id: 1, title: 'Apex Legends', playersOnline: 50000 },
      { id: 2, title: 'Fortnite', playersOnline: 45000 },
      { id: 3, title: 'League of Legends', playersOnline: 40000 },
      { id: 4, title: 'Call of Duty: Warzone', playersOnline: 38000 },
      { id: 5, title: 'Minecraft', playersOnline: 35000 },
    ];
  
    const sortedGames = simulatedTopGames.sort((a, b) => b.playersOnline - a.playersOnline);
  
    const top3Games = sortedGames.slice(0, 3);
  
    setTopGames(top3Games);
  }, []);

  return (
    <div>
      <h1>Welcome to the Gaming Community!</h1>

      <div>
        <h2>Friends Online</h2>
        <ul>
          {friendsOnline.map((friend) => (
            <li key={friend.id}>{friend.username}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Top-Rated Blog Posts</h2>
        <ul>
          {topRatedBlogPosts.map((post) => (
            <li key={post.id}>
              <strong>{post.title}</strong> by {post.author} (Rating: {post.rating})
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Top 3 Games with Most Players Online</h2>
        <ul>
          {topGames.map((game) => (
            <li key={game.id}>
              <strong>{game.title}</strong> - Players Online: {game.playersOnline}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;
