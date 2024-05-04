//Temporary data added
import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const mockUser = {
    id: 1,
    username: 'Test User',
    bio: 'Hello, I am a gaming enthusiast!',
    gameTags: [
      { id: 1, gameTitle: 'Fortnite', tag: 'ProPlayer123' },
      { id: 2, gameTitle: 'Apex Legends', tag: 'ApexMaster' },
    ],
    friends: [
      { id: 2, username: 'friend1', profilePicture: 'url-to-friend1-picture.jpg' },
      { id: 3, username: 'friend2', profilePicture: 'url-to-friend2-picture.jpg' },
    ],
  };

  const [userData, setUserData] = useState(mockUser);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);

  const [newPassword, setNewPassword] = useState('');

  const [isEditingGameTags, setIsEditingGameTags] = useState(false);

  useEffect(() => {
    setUserData(mockUser);
  }, []);

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSavePassword = () => {
    setIsEditingPassword(false);
  };

  const handleSaveGameTags = () => {
    setIsEditingGameTags(false);
  };

  return (
    <div>
      <h1>User Profile</h1>

      <div>
        <h2>{userData.username}</h2>
        {isEditingProfile ? (
          <div>
            <textarea
              value={userData.bio}
              onChange={(e) => setUserData({ ...userData, bio: e.target.value })}
            />
            <button onClick={handleSaveProfile}>Save Profile</button>
          </div>
        ) : (
          <p>{userData.bio}</p>
        )}
        <button onClick={() => setIsEditingProfile(!isEditingProfile)}>
          {isEditingProfile ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>
      {isEditingPassword ? (
        <div>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button onClick={handleSavePassword}>Save Password</button>
        </div>
      ) : (
        <button onClick={() => setIsEditingPassword(true)}>Change Password</button>
      )}

      <div>
        <h2>Game Tags</h2>
        {isEditingGameTags ? (
          <div>
            {userData.gameTags.map((tag) => (
              <div key={tag.id}>
                <p>{tag.gameTitle}</p>
                <input
                  type="text"
                  value={tag.tag}
                  onChange={(e) =>
                    setUserData({
                      ...userData,
                      gameTags: userData.gameTags.map((t) =>
                        t.id === tag.id ? { ...t, tag: e.target.value } : t
                      ),
                    })
                  }
                />
              </div>
            ))}
            <button onClick={handleSaveGameTags}>Save Game Tags</button>
          </div>
        ) : (
          <ul>
            {userData.gameTags.map((tag) => (
              <li key={tag.id}>
                <strong>{tag.gameTitle}</strong>: {tag.tag}
              </li>
            ))}
          </ul>
        )}
        <button onClick={() => setIsEditingGameTags(!isEditingGameTags)}>
          {isEditingGameTags ? 'Cancel Editing' : 'Edit Game Tags'}
        </button>
      </div>

      <div>
        <h2>Friend List</h2>
        <ul>
          {userData.friends.map((friend) => (
            <li key={friend.id}>
              <img src={friend.profilePicture} alt="Friend" />
              <p>{friend.username}</p>
              <button>View Profile</button>
              <button>Remove Friend</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserProfile;
