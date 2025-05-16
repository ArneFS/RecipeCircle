import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export default function LegacyRecipeList() {
  const { currentUser } = useAuth();
  const [legacyRecipes, setLegacyRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLegacyRecipes() {
      if (!currentUser) return;
      
      try {
        // In a real app, you would filter by familyGroupID
        // This is a simplified version that shows all legacy recipes by the current user
        const q = query(
          collection(db, 'legacyRecipes'),
          where('uploaderUID', '==', currentUser.uid),
          orderBy('uploadedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const recipeList = [];
        
        querySnapshot.forEach((doc) => {
          recipeList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setLegacyRecipes(recipeList);
      } catch (error) {
        setError('Failed to fetch legacy recipes: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLegacyRecipes();
  }, [currentUser]);

  if (loading) {
    return <div className="text-center py-8">Loading legacy recipes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif">Legacy Recipes</h2>
        <Link 
          to="/upload-legacy-recipe" 
          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition duration-200"
        >
          Upload Legacy Recipe
        </Link>
      </div>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {legacyRecipes.length === 0 ? (
        <div className="text-center py-8 bg-amber-50 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-4">You haven't uploaded any legacy recipes yet.</p>
          <p className="text-gray-600 mb-4">Legacy recipes are scans or photos of handwritten recipe cards or pages.</p>
          <Link 
            to="/upload-legacy-recipe" 
            className="text-amber-600 hover:text-amber-800 underline"
          >
            Upload your first legacy recipe
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legacyRecipes.map(recipe => (
            <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
              <div className="h-64 overflow-hidden">
                <img 
                  src={recipe.imageURL} 
                  alt={recipe.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-serif mb-2">{recipe.title}</h3>
                <p className="text-gray-600 text-sm mb-2">Uploaded by {recipe.uploaderName}</p>
                {recipe.notes && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{recipe.notes}</p>
                )}
                <Link 
                  to={`/legacy-recipe/${recipe.id}`} 
                  className="text-amber-600 hover:text-amber-800"
                >
                  View Full Size →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
