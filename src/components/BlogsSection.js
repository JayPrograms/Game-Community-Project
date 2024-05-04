import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';

//GraphQL queries and mutations
const GET_POSTS = gql`
  query GetPosts {
    getBlogPosts {
      id
      title
      content
      author_id
      author_username
      created_at
      upvotes
      downvotes
      currentUserVote
    }
  }
`;

const CREATE_POST = gql`
  mutation CreatePost($title: String!, $content: String!, $author: String!) {
    createBlogPost(title: $title, content: $content, author: $author) {
      id
      title
      content
      author_id
      created_at
      upvotes
      downvotes
    }
  }
`;

const UPVOTE_POST = gql`
  mutation UpvotePost($postId: ID!) {
    upvoteBlogPost(postId: $postId) {
      id
      upvotes
      downvotes
      currentUserVote
    }
  }
`;

const DOWNVOTE_POST = gql`
  mutation DownvotePost($postId: ID!) {
    downvoteBlogPost(postId: $postId) {
      id
      upvotes
      downvotes
      currentUserVote
    }
  }
`;


const PostFeed = () => {
  const [newTitle, setNewTitle] = useState('');
  const [newPost, setNewPost] = useState('');
  const { loading, error, data } = useQuery(GET_POSTS);
  const [createPost] = useMutation(CREATE_POST);
  const [upvotePost] = useMutation(UPVOTE_POST);
  const [downvotePost] = useMutation(DOWNVOTE_POST);

  const handleCreatePost = async () => {
    try {
      const author = 'authenticatedUser';
      await createPost({ variables: { title: newTitle, content: newPost, author } });
      setNewTitle('');
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpvote = async (postId) => {
    const post = data.getBlogPosts.find((p) => p.id === postId);
    if (post.currentUserVote === 'UP') {
      try {
        await downvotePost({ variables: { postId } });
      } catch (error) {
        console.error('Error removing upvote:', error);
      }
    } else if (post.currentUserVote === 'DOWN') {
      try {
        await upvotePost({ variables: { postId } });
      } catch (error) {
        console.error('Error upvoting post:', error);
      }
    } else {
      try {
        await upvotePost({ variables: { postId } });
      } catch (error) {
        console.error('Error upvoting post:', error);
      }
    }
  };
  
  const handleDownvote = async (postId) => {
    const post = data.getBlogPosts.find((p) => p.id === postId);
    if (post.currentUserVote === 'DOWN') {
      try {
        await upvotePost({ variables: { postId } });
      } catch (error) {
        console.error('Error removing downvote:', error);
      }
    } else if (post.currentUserVote === 'UP') {
      try {
        await downvotePost({ variables: { postId } });
      } catch (error) {
        console.error('Error downvoting post:', error);
      }
    } else {
      try {
        await downvotePost({ variables: { postId } });
      } catch (error) {
        console.error('Error downvoting post:', error);
      }
    }
  };  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
      </div>
      <div>
        <textarea
          placeholder="What's on your mind?"
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button onClick={handleCreatePost}>Post</button>
      </div>

      <div>
        <label>Filter by:</label>
        <select>
          <option value="popularity">Popularity</option>
          <option value="date">Date</option>
          <option value="gameTag">Game Tag</option>
        </select>
      </div>

      <div>
        {data.getBlogPosts.map((post) => (
          <div key={post.id}>
            <p>{post.content}</p>
            <p>Author: {post.author_username}</p>
            <p>Votes: {post.upvotes - post.downvotes}</p>
            <div>
            <button onClick={() => handleUpvote(post.id)} disabled={post.currentUserVote === 'UP'}>Upvote</button>
            <button onClick={() => handleDownvote(post.id)} disabled={post.currentUserVote === 'DOWN'}>Downvote</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostFeed;
