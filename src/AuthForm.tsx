// src/AuthForm.tsx
import { useState } from 'react';
import { auth } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

function AuthForm() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 max-w-sm w-full mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-amber-600">
        {isLoginMode ? 'Log In' : 'Create an Account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-xl transition"
        >
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </button>
      </form>
      <p className="text-sm text-center mt-4 text-gray-600">
        {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => setIsLoginMode(!isLoginMode)}
          className="text-amber-600 font-medium hover:underline"
        >
          {isLoginMode ? 'Sign up here' : 'Log in here'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
