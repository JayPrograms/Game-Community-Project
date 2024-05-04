//needs work, only mock data
import React, { useState, useEffect } from 'react';

const GameInformation = () => {
  const [gameData, setGameData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const simulatedGameData = [
      {
        id: 1,
        name: 'Fortnite',
        about: 'A thrilling adventure in a virtual world.',
        activePlayers: 100000,
        votes: 0,
      },
      {
        id: 2,
        name: 'Minecraft',
        about: 'Explore a mysterious fantasy realm.',
        activePlayers: 75000,
        votes: 0,
      },
      {
        id: 3,
        name: 'League of Legends',
        about: 'Survive in a post-apocalyptic wasteland.',
        activePlayers: 50000,
        votes: 0,
      },
    ];

    setGameData(simulatedGameData);
  }, []);

  const handleVote = (gameId, type) => {
    setGameData((prevGameData) =>
      prevGameData.map((game) =>
        game.id === gameId
          ? { ...game, votes: type === 'upvote' ? game.votes + 1 : game.votes - 1 }
          : game
      )
    );
  };

  const filteredGames = gameData.filter((game) =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Game Information</h2>

      <input
        type="text"
        placeholder="Search for a game"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredGames.map((game) => (
        <div key={game.id}>
          <h3>{game.name}</h3>
          <p>{game.about}</p>
          <p>Total Active Players: {game.activePlayers}</p>
          <p>Votes: {game.votes}</p>
          <button onClick={() => handleVote(game.id, 'upvote')}>Upvote</button>
          <button onClick={() => handleVote(game.id, 'downvote')}>Downvote</button>
        </div>
      ))}
    </div>
  );
};

export default GameInformation;
