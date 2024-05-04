const express = require('express');
const { ApolloServer, gql, PubSub } = require('apollo-server-express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

// PostgreSQL configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'gaming_community',
  password: 'jay123',
  port: 5432,
});
console.log("starting")

// GraphQL schema
const typeDefs = gql`
type User {
  id: ID!
  username: String!
  email: String!
  profile: UserProfile
  friends: [User]
  games: [Game]
}

type UserProfile {
  bio: String
  avatar: String
}

type AuthToken {
  token: String!
  user: User!
}

type BlogPost {
  id: Int!
  title: String!
  content: String!
  author_id: String
  created_at: String!
  upvotes: Int!
  downvotes: Int!
  author_username: String
  currentUserVote: Int
}

type FriendRequest {
  id: ID!
  fromUser: User!
  toUser: User!
  status: String!
}

type Game {
  id: ID!
  name: String!
  description: String!
  upvotes: Int!
  downvotes: Int!
}

type FeaturePost {
  id: ID!
  title: String!
  content: String!
  author_id: User!
  created_at: String!
  upvotes: Int!
  downvotes: Int!
}

type Query {
  getUser(id: ID!): User
  getAllUsers: [User]
  getBlogPosts: [BlogPost]!
  getBlogPost(id: ID!): BlogPost
  getIncomingFriendRequests: [FriendRequest]
  getOutgoingFriendRequests: [FriendRequest]
  getGames: [Game]
  getFeaturePosts: [FeaturePost]
  getMessages(toUserId: ID!): [Message]
  searchUsers(username: String!): [User]
  getCurrentUserId: ID
}

type Mutation {
  registerUser(username: String!, email: String!, password: String!): AuthToken
  loginUser(email: String!, password: String!): AuthToken
  updateUserProfile(bio: String, avatar: String): UserProfile
  createBlogPost(author: String!, title: String!, content: String!): BlogPost!
  updateBlogPost(id: ID!, title: String!, content: String!): BlogPost
  deleteBlogPost(id: ID!): BlogPost
  sendFriendRequest(fromUserId: ID!, toUserId: ID!): FriendRequest
  respondToFriendRequest(requestId: ID!, response: String!): FriendRequest
  addGame(name: String!, description: String!): Game
  upvoteGame(gameId: ID!): Game
  downvoteGame(gameId: ID!): Game
  createFeaturePost(title: String!, content: String!): FeaturePost
  upvoteBlogPost(postId: ID!): BlogPost
  downvoteBlogPost(postId: ID!): BlogPost
  sendMessage(toUserId: ID!, content: String!): Message
  createMessage(toUserId: ID!, content: String!): Message
  deleteMessage(messageId: ID!): Message
}

type Subscription {
  friendRequestReceived: FriendRequest
  messageReceived: Message
  messageSent(toUserId: ID!): Message
}

type Message {
  id: ID!
  content: String!
  fromUser: User!
  toUser: User!
  createdAt: String!
}
`

const saltRounds = 10;

const verifyToken = (token) => {
  console.log("TOkeN: ", token)
  try {
    const decoded = jwt.verify(token, 'your_secret_key');
    
    if (decoded.exp < Date.now() / 1000) {
      throw new Error('Token expired');
    }
    
    return decoded;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
};

const getUserIdFromContext = (context) => {
  return context.user ? context.user.id : null;
};

const createUser = async (username, email, password) => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    const { rows } = await pool.query(
      'INSERT INTO users(username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, hashedPassword]
    );

    return rows[0];
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const authenticateUser = async (email, password) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (rows.length > 0) {
      const storedHashedPassword = rows[0].password;
      console.log('Provided Password:', password);
      console.log('Stored Hashed Password:', storedHashedPassword);

      if (await bcrypt.compare(password, storedHashedPassword)) {
        console.log('Password Matched!');
        return rows[0];
      } else {
        console.error('Password Mismatch');
        throw new Error('Invalid password');
      }
    } else {
      console.error('User not found');
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    throw error;
  }
};

const updateUserProfile = async (parent, { bio, avatar }, context, info) => {
  const userId = getUserIdFromContext(context);
  try {
    const existingProfile = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);

    if (existingProfile.rows.length > 0) {
      const { rows } = await pool.query(
        'UPDATE user_profiles SET bio = $2, avatar = $3 WHERE user_id = $1 RETURNING *',
        [userId, bio, avatar]
      );

      return rows[0].profile || null;
    } else {
      const { rows } = await pool.query(
        'INSERT INTO user_profiles(user_id, bio, avatar) VALUES ($1, $2, $3) RETURNING *',
        [userId, bio, avatar]
      );

      return rows[0].profile || null;
    }
  } catch (error) {
    console.error('Error updating/creating user profile:', error);
    throw error;
  }
};

const removeFriend = async (userId, friendId) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM user_friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1) RETURNING *',
      [userId, friendId]
    );

    if (rows.length > 0) {
      return rows[0];
    } else {
      throw new Error('Friend relationship not found');
    }
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

const generateAuthToken = (user) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const token = jwt.sign({ id: user.id, email: user.email, timestamp: currentTime }, 'your_secret_key', { expiresIn: '24h' });
  return token;
};

const resolvers = {
  Query: {

    getCurrentUserId: (_, args, context) => {
      console.log("hello WORLD")
      try {
        const authToken = context.token || '';
        const user = verifyToken(authToken);
        console.log('User check:', user);
        const userId = user ? user.id : null;
        console.log('authToken check:', authToken);
        console.log('User ID sent to frontend:', userId);
        return userId;
      } catch (error) {
        console.error('Error fetching current user ID:', error);
        throw new Error('Failed to get current user ID');
      }
    },
    
    getFeaturePosts: async () => {
      try {
        const { rows } = await pool.query('SELECT * FROM feature_posts');
        return rows;
      } catch (error) {
        console.error('Error fetching feature posts:', error);
        throw error;
      }
    },

    getGames: async () => {
      try {
        const { rows } = await pool.query('SELECT * FROM games');
        return rows;
      } catch (error) {
        console.error('Error fetching games:', error);
        throw error;
      }
    },

    getUser: async (parent, { id }, context, info) => {
      const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return rows[0];
    },

    getAllUsers: async () => {
      try {
        const { rows } = await pool.query('SELECT * FROM users');
        return rows;
      } catch (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }
    },

    getBlogPosts: async (_, __, context) => {
      try {
        const { rows } = await pool.query('SELECT * FROM blog_posts');
        return rows;
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }
    },
    
    getBlogPost: async (_, { id }) => {
      try {
        const { rows } = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [id]);
        return rows[0];
      } catch (error) {
        console.error(`Error fetching blog post with ID ${id}:`, error);
        throw error;
      }
    },

    getIncomingFriendRequests: async (_, __, { user }) => {
      try {
        console.log('Fetching incoming friend requests...');
        console.log('Authenticated user:', user);
        const { id } = user;
        const { rows } = await pool.query('SELECT * FROM friend_requests WHERE to_user_id = $1', [id]);
    
        const requestsWithUserData = await Promise.all(
          rows.map(async (request) => {
            const fromUser = await getUserById(request.from_user_id);
            return { ...request, fromUser };
          })
        );
    
        console.log('Retrieved friend requests:', requestsWithUserData);
        return requestsWithUserData;
      } catch (error) {
        console.error('Error fetching incoming friend requests:', error);
        throw error;
      }
    },
    
    

    getOutgoingFriendRequests: async (_, __, { user }) => {
      try {
        const { id } = user;
        const { rows } = await pool.query('SELECT * FROM friend_requests WHERE from_user_id = $1', [id]);
        return rows;
      } catch (error) {
        console.error('Error fetching outgoing friend requests:', error);
        throw error;
      }
    },

    searchUsers: async (_, { username }, context) => {
      try {
        const { rows } = await pool.query('SELECT * FROM users WHERE username ILIKE $1', [`%${username}%`]);
        return rows;
      } catch (error) {
        console.error('Error searching users:', error);
        throw error;
      }
    },
  },

  Subscription: {
  },

  Mutation: {
    registerUser: async (parent, { username, email, password }, context, info) => {
      const user = await createUser(username, email, password);
      const token = generateAuthToken(user);
      return { token, user };
    },
    
    loginUser: async (parent, { email, password }, context, info) => {
      try {
        const user = await authenticateUser(email, password);
        console.log('User Authenticated:', user);
        const token = generateAuthToken(user);
        return { token, user };
      } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
      }
    },    

    sendMessage: async (parent, { toUserId, content }, context, info) => {
      const fromUser = context.getCurrentUser();
      const toUser = await getUserById(toUserId);

      if (!toUser) {
        throw new Error('User not found');
      }

      const message = await createMessage(fromUser.id, toUser.id, content);
      pubsub.publish('MESSAGE_RECEIVED', { message });
      return message;
    },

    createFeaturePost: async (parent, { title, content }, context, info) => {
      try {
        const { rows } = await pool.query(
          'INSERT INTO feature_posts(title, content, upvotes, downvotes) VALUES ($1, $2, 0, 0) RETURNING *',
          [title, content]
        );
        return rows[0];
      } catch (error) {
        console.error('Error creating feature post:', error);
        throw error;
      }
    },

    upvoteBlogPost: async (_, { postId }, context) => {
      try {
        const userId = getUserIdFromContext(context);
        if (!userId) {
          throw new Error('User not authenticated');
        }
    
        const existingVote = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    
        if (existingVote.rows.length > 0 && existingVote.rows[0].vote_type === 'upvote') {
          await pool.query('DELETE FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
          await pool.query('UPDATE blog_posts SET upvotes = upvotes - 1 WHERE id = $1', [postId]);
        } else {
          if (existingVote.rows.length > 0 && existingVote.rows[0].vote_type === 'downvote') {
            await pool.query('DELETE FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
            await pool.query('UPDATE blog_posts SET downvotes = downvotes - 1 WHERE id = $1', [postId]);
          }
    
          await pool.query('INSERT INTO votes (user_id, post_id, vote_type) VALUES ($1, $2, $3)', [userId, postId, 'upvote']);
          await pool.query('UPDATE blog_posts SET upvotes = upvotes + 1 WHERE id = $1', [postId]);
        }
    
        const { rows } = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [postId]);
        return rows[0];
      } catch (error) {
        console.error(`Error upvoting blog post with ID ${postId}:`, error);
        throw error;
      }
    },
    
    downvoteBlogPost: async (_, { postId }, context) => {
      try {
        const userId = getUserIdFromContext(context);
        if (!userId) {
          throw new Error('User not authenticated');
        }
    
        const existingVote = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
    
        if (existingVote.rows.length > 0 && existingVote.rows[0].vote_type === 'downvote') {
          await pool.query('DELETE FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
          await pool.query('UPDATE blog_posts SET downvotes = downvotes - 1 WHERE id = $1', [postId]);
        } else {
          if (existingVote.rows.length > 0 && existingVote.rows[0].vote_type === 'upvote') {
            await pool.query('DELETE FROM votes WHERE user_id = $1 AND post_id = $2', [userId, postId]);
            await pool.query('UPDATE blog_posts SET upvotes = upvotes - 1 WHERE id = $1', [postId]);
          }
    
          await pool.query('INSERT INTO votes (user_id, post_id, vote_type) VALUES ($1, $2, $3)', [userId, postId, 'downvote']);
          await pool.query('UPDATE blog_posts SET downvotes = downvotes + 1 WHERE id = $1', [postId]);
        }
    
        const { rows } = await pool.query('SELECT * FROM blog_posts WHERE id = $1', [postId]);
        return rows[0];
      } catch (error) {
        console.error(`Error downvoting blog post with ID ${postId}:`, error);
        throw error;
      }
    },
        
    addGame: async (parent, { name, description }, context, info) => {
      try {
        const { rows } = await pool.query(
          'INSERT INTO games(name, description, upvotes, downvotes) VALUES ($1, $2, 0, 0) RETURNING *',
          [name, description]
        );
        return rows[0];
      } catch (error) {
        console.error('Error adding game:', error);
        throw error;
      }
    },

    upvoteGame: async (parent, { gameId }, context, info) => {
      try {
        const { rows } = await pool.query(
          'UPDATE games SET upvotes = upvotes + 1 WHERE id = $1 RETURNING *',
          [gameId]
        );
        return rows[0];
      } catch (error) {
        console.error(`Error upvoting game with ID ${gameId}:`, error);
        throw error;
      }
    },

    downvoteGame: async (parent, { gameId }, context, info) => {
      try {
        const { rows } = await pool.query(
          'UPDATE games SET downvotes = downvotes + 1 WHERE id = $1 RETURNING *',
          [gameId]
        );
        return rows[0];
      } catch (error) {
        console.error(`Error downvoting game with ID ${gameId}:`, error);
        throw error;
      }
    },

    sendFriendRequest: async (parent, { fromUserId, toUserId }, context, info) => {
      try {
        console.log('Received request to send friend request from user:', fromUserId, 'to user:', toUserId);
        const { rows } = await pool.query(
          'INSERT INTO friend_requests(from_user_id, to_user_id, status) VALUES ($1, $2, $3) RETURNING *',
          [fromUserId, toUserId, 'PENDING']
        );
        return rows[0];
      } catch (error) {
        console.error(`Error sending friend request to user with ID ${toUserId}:`, error);
        throw error;
      }
    },
    
    respondToFriendRequest: async (_, { requestId, response }, { user }) => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }
    
        const { rows } = await pool.query('SELECT * FROM friend_requests WHERE id = $1', [requestId]);
        const friendRequest = rows[0];
    
        if (!friendRequest) {
          throw new Error('Friend request not found');
        }
        
        if (friendRequest.to_user_id !== user.id) {
          throw new Error('Unauthorized to respond to this friend request');
        }
    
        const status = response.toUpperCase();
        const { rows: updatedRows } = await pool.query(
          'UPDATE friend_requests SET status = $1 WHERE id = $2 RETURNING *',
          [status, requestId]
        );
        const updatedRequest = updatedRows[0];
    
        return updatedRequest;
      } catch (error) {
        console.error('Error responding to friend request:', error);
        throw new Error('Failed to respond to friend request');
      }
    },
    
    createBlogPost: async (_, { title, content }, context) => {
      try {
        const userId = context.currentUserId;
        if (!userId) {
          throw new Error('User not authenticated');
        }
    
        const { rows } = await pool.query(
          'INSERT INTO blog_posts(title, content, author_id, upvotes, downvotes, current_user_vote) VALUES ($1, $2, $3, 0, 0, 0) RETURNING *',
          [title, content, userId]
        );
    
        const blogPost = rows[0];
    
        const authorQuery = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
        const authorUsername = authorQuery.rows[0].username;
    
        const updateQuery = await pool.query('UPDATE blog_posts SET author_username = $1 WHERE id = $2', [authorUsername, blogPost.id]);
      
        blogPost.author_username = authorUsername;
    
        return blogPost;
      } catch (error) {
        console.error('Error creating blog post:', error);
        throw error;
      }
    },
    
    updateBlogPost: async (_, { id, title, content }, context) => {
      try {
        const { rows } = await pool.query(
          'UPDATE blog_posts SET title = $2, content = $3 WHERE id = $1 RETURNING *',
          [id, title, content]
        );
        return rows[0];
      } catch (error) {
        console.error(`Error updating blog post with ID ${id}:`, error);
        throw error;
      }
    },

    deleteBlogPost: async (_, { id }) => {
      try {
        const { rows } = await pool.query('DELETE FROM blog_posts WHERE id = $1 RETURNING *', [id]);
        return rows[0];
      } catch (error) {
        console.error(`Error deleting blog post with ID ${id}:`, error);
        throw error;
      }
    },

    updateUserProfile: async (parent, { bio, avatar }, context, info) => {
      const userId = getUserIdFromContext(context);
    
      try {
        const existingProfile = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
        if (existingProfile.rows.length > 0) {
          const { rows } = await pool.query(
            'UPDATE user_profiles SET bio = $2, avatar = $3 WHERE user_id = $1 RETURNING *',
            [userId, bio, avatar]
          );
    
          return rows[0].profile;
        } else {
          const { rows } = await pool.query(
            'INSERT INTO user_profiles(user_id, bio, avatar) VALUES ($1, $2, $3) RETURNING *',
            [userId, bio, avatar]
          );
    
          return rows[0].profile;
        }
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    },

  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    try {
      let token = null;
      let user = null;
      let currentUserId = null;

      if (req && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        token = authHeader.replace('Bearer ', '');
        console.log('Received token:', token);
        user = verifyToken(token);
        currentUserId = user ? user.id : null;
      } else {
        console.log('Authorization header missing');
      }

      return { token, user, currentUserId };
    } catch (error) {
      console.error('Error extracting token:', error);
      throw error;
    }
  },
});

async function startApolloServer() {
  await server.start();
  server.applyMiddleware({ app });
}

startApolloServer().then(() => {
    app.listen(port, () => {
      console.log(`GraphQL server running at http://localhost:${port}/graphql`);
    });
  });