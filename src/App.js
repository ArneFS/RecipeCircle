import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import CreateFamilyGroup from './components/CreateFamilyGroup';
import JoinFamilyGroup from './components/JoinFamilyGroup';
import AddRecipe from './components/AddRecipe';
import RecipeList from './components/RecipeList';
import ViewRecipe from './components/ViewRecipe';
import EditRecipe from './components/EditRecipe';
import UploadLegacyRecipe from './components/UploadLegacyRecipe';
import LegacyRecipeList from './components/LegacyRecipeList';
import ViewLegacyRecipe from './components/ViewLegacyRecipe';
import ExportCookbook from './components/ExportCookbook';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-amber-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Private Routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/create-family-group" element={<PrivateRoute><CreateFamilyGroup /></PrivateRoute>} />
              <Route path="/join-family-group" element={<PrivateRoute><JoinFamilyGroup /></PrivateRoute>} />
              
              {/* Recipe Routes */}
              <Route path="/recipes" element={<PrivateRoute><RecipeList /></PrivateRoute>} />
              <Route path="/add-recipe" element={<PrivateRoute><AddRecipe /></PrivateRoute>} />
              <Route path="/recipe/:recipeId" element={<PrivateRoute><ViewRecipe /></PrivateRoute>} />
              <Route path="/edit-recipe/:recipeId" element={<PrivateRoute><EditRecipe /></PrivateRoute>} />
              
              {/* Legacy Recipe Routes */}
              <Route path="/legacy-recipes" element={<PrivateRoute><LegacyRecipeList /></PrivateRoute>} />
              <Route path="/upload-legacy-recipe" element={<PrivateRoute><UploadLegacyRecipe /></PrivateRoute>} />
              <Route path="/legacy-recipe/:recipeId" element={<PrivateRoute><ViewLegacyRecipe /></PrivateRoute>} />
              
              {/* Export Route */}
              <Route path="/export-cookbook" element={<PrivateRoute><ExportCookbook /></PrivateRoute>} />
              
              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-amber-100 py-4 mt-8">
            <div className="container mx-auto px-4 text-center text-amber-800">
              <p>Family Recipe Hub &copy; {new Date().getFullYear()}</p>
              <p className="text-sm mt-1">Preserving family recipes for generations to come</p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
