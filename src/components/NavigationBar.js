//Needs work, just concept right now
import React from 'react';
import { Link } from 'react-router-dom';

const NavigationBar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/blogs">
            <button>Blogs Section</button>
          </Link>
        </li>
        <li>
          <Link to="/featuredposts">
            <button>Feature Posts</button>
          </Link>
        </li>
        <li>
          <Link to="/friends">
            <button>Friend Management</button>
          </Link>
        </li>
        <li>
          <Link to="/gameinfo">
            <button>Game Information</button>
          </Link>
        </li>
        <li>
          <Link to="/gamerankings">
            <button>Game Rankings</button>
          </Link>
        </li>
        <li>
          <Link to="/">
            <button>Home Page</button>
          </Link>
        </li>
        <li>
          <Link to="/signin">
            <button>Sign In</button>
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <button>User Profile</button>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
