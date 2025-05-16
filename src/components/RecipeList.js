import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export default function RecipeList() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchRecipes() {
      if (!currentUser) return;
      
      try {
        // In a real app, you would filter by familyGroupID
        // This is a simplified version that shows all recipes by the current user
        const q = query(
          collection(db, 'recipes'),
          where('creatorUID', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const recipeList = [];
        
        querySnapshot.forEach((doc) => {
          recipeList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setRecipes(recipeList);
      } catch (error) {
        setError('Failed to fetch recipes: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecipes();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-8">Loading recipes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Your Family Recipes</h2>
        <Link 
          to="/add-recipe" 
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition duration-200"
        >
          Add New Recipe
        </Link>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {recipes.length === 0 ? (
        <div className="text-center py-8 bg-amber-50 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">You haven't added any recipes yet.</p>
          <Link 
            to="/add-recipe" 
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Add your first recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
              {recipe.photoURL ? (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={recipe.photoURL} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-500 text-4xl">🍽️</span>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-xl font-serif mb-2">{recipe.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{recipe.versionTag}</p>
                <p className="text-gray-500 text-sm mb-4">
                  {recipe.ingredients.length} ingredients • {recipe.steps.length} steps
                </p>
                <Link 
                  to={`/recipe/${recipe.id}`} 
                  className="text-amber-600 hover:text-amber-800"
                >
                  View Recipe →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
