import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

export default function ViewLegacyRecipe() {
  const { recipeId } = useParams();
  const { currentUser } = useAuth();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLegacyRecipe() {
      try {
        const recipeRef = doc(db, 'legacyRecipes', recipeId);
        const recipeSnap = await getDoc(recipeRef);
        
        if (recipeSnap.exists()) {
          setRecipe({
            id: recipeSnap.id,
            ...recipeSnap.data()
          });
        } else {
          setError('Legacy recipe not found');
        }
      } catch (error) {
        setError('Failed to fetch legacy recipe: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLegacyRecipe();
  }, [recipeId]);

  if (loading) {
    return <div className="text-center py-8">Loading legacy recipe...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <Link to="/legacy-recipes" className="text-amber-600 hover:text-amber-800">← Back to Legacy Recipes</Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">Recipe not found</div>
        <Link to="/legacy-recipes" className="text-amber-600 hover:text-amber-800">← Back to Legacy Recipes</Link>
      </div>
    );
  }

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <Link to="/legacy-recipes" className="text-amber-600 hover:text-amber-800">← Back to Legacy Recipes</Link>
      </div>
      
      {/* Recipe Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{recipe.title}</h1>
        <p className="text-gray-600 mb-1">Uploaded by {recipe.uploaderName}</p>
        {recipe.uploadedAt && (
          <p className="text-gray-500 text-sm">Uploaded on {formatDate(recipe.uploadedAt)}</p>
        )}
      </div>
      
      {/* Recipe Image */}
      <div className="mb-8">
        <img 
          src={recipe.imageURL} 
          alt={recipe.title} 
          className="w-full rounded-lg shadow-md"
        />
      </div>
      
      {/* Notes */}
      {recipe.notes && (
        <div className="mb-8">
          <h2 className="text-2xl font-serif mb-4">Notes</h2>
          <div className="bg-amber-50 p-4 rounded-lg">
            <p className="text-gray-700">{recipe.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
