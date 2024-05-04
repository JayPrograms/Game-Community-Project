import { gql } from '@apollo/client';

// Define your GraphQL queries, mutations, and subscriptions here

export const GET_USER = gql`
  query GetUser($userId: ID!) {
    getUser(id: $userId) {
      id
      username
      email
      profile {
        bio
        avatar
      }
      friends {
        id
        username
        email
        profile {
          bio
          avatar
        }
      }
      games {
        id
        name
        description
        upvotes
        downvotes
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      username
      email
      profile {
        bio
        avatar
      }
    }
  }
`;

export const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    getBlogPosts {
      id
      title
      content
      author {
        id
        username
        email
        profile {
          bio
          avatar
        }
      }
      createdAt
    }
  }
`;

export const GET_BLOG_POST = gql`
  query GetBlogPost($postId: ID!) {
    getBlogPost(id: $postId) {
      id
      title
      content
      author {
        id
        username
        email
        profile {
          bio
          avatar
        }
      }
      createdAt
    }
  }
`;

export const GET_FEATURE_POSTS = gql`
  query GetFeaturePosts {
    getFeaturePosts {
      id
      title
      content
      author {
        id
        username
        email
        profile {
          bio
          avatar
        }
      }
      createdAt
      upvotes
      downvotes
    }
  }
`;

export const GET_GAMES = gql`
  query GetGames {
    getGames {
      id
      name
      description
      upvotes
      downvotes
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($toUserId: ID!) {
    getMessages(toUserId: $toUserId) {
      id
      content
      fromUser {
        id
        username
        email
        profile {
          bio
          avatar
        }
      }
      toUser {
        id
        username
        email
        profile {
          bio
          avatar
        }
      }
      createdAt
    }
  }
`;

// Define other queries, mutations, and subscriptions as needed
