import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const SIGN_UP_MUTATION = gql`
  mutation registerUser($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password) {
      token
      user {
        id
        email
        # Include other user fields if needed
      }
    }
  }
`;

const SIGN_IN_MUTATION = gql`
  mutation loginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        email
        # Include other user fields if needed
      }
    }
  }
`;

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [signUpMutation] = useMutation(SIGN_UP_MUTATION);
  const [signInMutation] = useMutation(SIGN_IN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSigningUp) {
      if (password === confirmPassword) {
        try {
          const { data } = await signUpMutation({
            variables: { username, email, password },
          });

          const token = data.registerUser.token;
          localStorage.setItem('token', token);

          console.log('Signed up successfully:', data);
        } catch (error) {
          console.error('Sign-up error:', error);
        }
      } else {
        console.error('Passwords do not match');
      }
    } else {
      try {
        const { data } = await signInMutation({
          variables: { email, password },
        });

        const token = data.loginUser.token;
        localStorage.setItem('token', token);

        console.log('Signed in successfully:', data);
      } catch (error) {
        console.error('Sign-in error:', error);
      }
    }

    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div>
      <h2>{isSigningUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        {isSigningUp && (
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isSigningUp && (
          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <button type="submit">{isSigningUp ? 'Sign Up' : 'Sign In'}</button>
        </div>
      </form>
      <div>
        <p>{isSigningUp ? 'Already have an account?' : 'Don\'t have an account?'}</p>
        <button onClick={() => setIsSigningUp(!isSigningUp)}>
          {isSigningUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
};

export default SignIn;
