import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      // Redirect will be handled by the router
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav className="bg-amber-500 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-white text-2xl font-serif">Family Recipe Hub</a>
        
        <div>
          {currentUser ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">Hello, {currentUser.displayName || 'User'}</span>
              <button 
                onClick={handleLogout}
                className="bg-white text-amber-600 px-4 py-2 rounded-md hover:bg-amber-100 transition duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-x-2">
              <a 
                href="/login" 
                className="text-white hover:text-amber-200 transition duration-200"
              >
                Login
              </a>
              <a 
                href="/signup" 
                className="bg-white text-amber-600 px-4 py-2 rounded-md hover:bg-amber-100 transition duration-200"
              >
                Sign Up
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
