//Needs work, current filled with mock data
import React, { useState, useEffect } from 'react';

const GameRanking = () => {
  const [gameRankings, setGameRankings] = useState([]);

  useEffect(() => {
    const simulatedGameRankings = [
      {
        id: 1,
        name: 'Fortnite',
        upvotes: 100,
        downvotes: 20,
        rank: 1,
      },
      {
        id: 2,
        name: 'Call Of Duty Warzone',
        upvotes: 90,
        downvotes: 15,
        rank: 2,
      },
      {
        id: 3,
        name: 'Minecraft',
        upvotes: 80,
        downvotes: 10,
        rank: 3,
      },
    ];

    setGameRankings(simulatedGameRankings);
  }, []);

  return (
    <div>
      <h2>Game Rankings</h2>

      <ul>
        {gameRankings.map((game) => (
          <li key={game.id}>
            <h3>{game.name}</h3>
            <p>Upvotes: {game.upvotes}</p>
            <p>Downvotes: {game.downvotes}</p>
            <p>Rank: {game.rank}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameRanking;
