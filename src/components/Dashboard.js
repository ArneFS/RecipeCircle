import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-center mb-8">Welcome to Family Recipe Hub</h1>
      
      {!currentUser ? (
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
          <p className="mb-4">Please log in or sign up to access your family recipes.</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/login" 
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Log In
            </Link>
            <Link 
              to="/signup" 
              className="bg-white border border-amber-500 text-amber-500 hover:bg-amber-50 px-4 py-2 rounded-md transition duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Recipe Management Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
              <h2 className="text-xl font-serif mb-4">Recipe Collection</h2>
              <p className="text-gray-600 mb-4">
                Add, view, and edit your family's favorite recipes. Keep all your recipes in one place.
              </p>
              <div className="flex space-x-2">
                <Link 
                  to="/recipes" 
                  className="text-amber-600 hover:text-amber-800"
                >
                  View Recipes
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                  to="/add-recipe" 
                  className="text-amber-600 hover:text-amber-800"
                >
                  Add New Recipe
                </Link>
              </div>
            </div>
            
            {/* Legacy Recipes Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
              <h2 className="text-xl font-serif mb-4">Legacy Recipes</h2>
              <p className="text-gray-600 mb-4">
                Preserve handwritten recipe cards and old cookbook pages by uploading photos or scans.
              </p>
              <div className="flex space-x-2">
                <Link 
                  to="/legacy-recipes" 
                  className="text-amber-600 hover:text-amber-800"
                >
                  View Legacy Recipes
                </Link>
                <span className="text-gray-300">|</span>
                <Link 
                  to="/upload-legacy-recipe" 
                  className="text-amber-600 hover:text-amber-800"
                >
                  Upload
                </Link>
              </div>
            </div>
            
            {/* Export Cookbook Card */}
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-200">
              <h2 className="text-xl font-serif mb-4">Export Cookbook</h2>
              <p className="text-gray-600 mb-4">
                Create a beautiful, printable PDF cookbook with your selected recipes.
              </p>
              <Link 
                to="/export-cookbook" 
                className="text-amber-600 hover:text-amber-800"
              >
                Create Cookbook
              </Link>
            </div>
          </div>
          
          {/* Family Group Section */}
          <div className="bg-amber-50 p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-serif mb-4">Family Groups</h2>
            <p className="text-gray-600 mb-4">
              Create or join a family group to share recipes with your family members.
            </p>
            <div className="flex space-x-4">
              <Link 
                to="/create-family-group" 
                className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Create Family Group
              </Link>
              <Link 
                to="/join-family-group" 
                className="bg-white border border-amber-500 text-amber-500 hover:bg-amber-50 px-4 py-2 rounded-md transition duration-200"
              >
                Join Family Group
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
