import React, { useState, useEffect } from 'react';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';

// Define your GraphQL queries and mutations
const SEARCH_USERS = gql`
  query SearchUsers($username: String!) {
    searchUsers(username: $username) {
      id
      username
      email
    }
  }
`;

const GET_INCOMING_FRIEND_REQUESTS = gql`
  query GetIncomingFriendRequests {
    getIncomingFriendRequests {
      id
      fromUser {
        id
        username
      }
    }
  }
`;

const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($fromUserId: ID!, $toUserId: ID!) {
    sendFriendRequest(fromUserId: $fromUserId, toUserId: $toUserId) {
      id
    }
  }
`;

const RESPOND_TO_FRIEND_REQUEST = gql`
  mutation RespondToFriendRequest($requestId: ID!, $response: String!) {
    respondToFriendRequest(requestId: $requestId, response: $response) {
      id
    }
  }
`;

const GET_CURRENT_USER_ID = gql`
  query GetCurrentUserId {
    getCurrentUserId
  }
`;

const Friends = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchUsers, { loading: searchLoading, error: searchError, data: searchData }] = useLazyQuery(SEARCH_USERS);
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST);
  const [respondToFriendRequest] = useMutation(RESPOND_TO_FRIEND_REQUEST);
  const { data: userData, loading: userLoading, error: userError } = useQuery(GET_CURRENT_USER_ID);
useEffect(() => {
  console.log("userData:", userData);
}, [userData]);

const { data: friendRequestsData, loading: friendRequestsLoading, error: friendRequestsError } = useQuery(GET_INCOMING_FRIEND_REQUESTS, {
  skip: !userData,
});

useEffect(() => {
  console.log("Sending to getIncomingFriendRequests query:", friendRequestsData);
}, [friendRequestsData]);

useEffect(() => {
  console.log("Received from getIncomingFriendRequests query:", friendRequestsData);
}, [friendRequestsError, friendRequestsData]);

useEffect(() => {
  console.log("Loading status of getIncomingFriendRequests query:", friendRequestsLoading);
}, [friendRequestsLoading]);

  useEffect(() => {
    if (userError) {
      console.error('Error fetching current user ID:', userError);
    }
  }, [userError]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    searchUsers({ variables: { username: searchInput } });
  };

  const handleSendFriendRequest = (userId) => {
    console.log('handleSendFriendRequest called with userId:', userId);
    console.log('userData:', userData);
    if (!userData) {
      console.error('User data not loaded yet');
      return;
    }
  
    const fromUserId = userData.getCurrentUserId;
    const toUserId = userId;
    console.log('fromUserId:', fromUserId);
    console.log('toUserId:', toUserId);
  
    sendFriendRequest({
      variables: { fromUserId, toUserId },
    })
      .then((response) => {
        console.log('Friend request sent successfully!', response);
      })
      .catch((error) => {
        console.error('Error sending friend request:', error);
      });
  };
  

  const handleRespondToFriendRequest = (requestId, response) => {
    if (!userData) {
      console.error('User data not loaded yet');
      return;
    }

    const fromUserId = userData.getCurrentUserId;
    if (!fromUserId) {
      console.error('Current user ID not found');
      return;
    }

    respondToFriendRequest({
      variables: { requestId, response },
    })
      .then((response) => {
        console.log('Responded to friend request successfully!', response);
      })
      .catch((error) => {
        console.error('Error responding to friend request:', error);
      });
  };

  if (!userData) {
    return null;
  }

  return (
    <div>
      <form onSubmit={handleSearchSubmit}>
        <input 
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {searchLoading && <p>Loading...</p>}
      {searchError && <p>Error...</p>}
      {searchData && (
        <ul>
          {searchData.searchUsers.map(user => (
            <li key={user.id}>
              <p>{user.username}</p>
              <button onClick={() => handleSendFriendRequest(user.id)}>Send Friend Request</button>
            </li>
          ))}
        </ul>
      )}
      
      <h2>Incoming Friend Requests</h2>
      {friendRequestsLoading && <p>Loading...</p>}
      {friendRequestsError && <p>Error...</p>}
      {friendRequestsData && (
        <ul>
          {friendRequestsData.getIncomingFriendRequests.map(request => (
            <li key={request.id}>
              <p>From: {request.fromUser.username}</p>
              <button onClick={() => handleRespondToFriendRequest(request.id, 'ACCEPT')}>Accept</button>
              <button onClick={() => handleRespondToFriendRequest(request.id, 'DECLINE')}>Decline</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Friends;
