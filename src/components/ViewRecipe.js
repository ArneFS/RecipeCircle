import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function ViewRecipe() {
  const { recipeId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeSnap = await getDoc(recipeRef);
        
        if (recipeSnap.exists()) {
          setRecipe({
            id: recipeSnap.id,
            ...recipeSnap.data()
          });
        } else {
          setError('Recipe not found');
        }
      } catch (error) {
        setError('Failed to fetch recipe: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecipe();
  }, [recipeId]);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'recipes', recipeId));
      navigate('/recipes');
    } catch (error) {
      setError('Failed to delete recipe: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading recipe...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <Link to="/recipes" className="text-amber-600 hover:text-amber-800">← Back to Recipes</Link>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center py-8">Recipe not found</div>
        <Link to="/recipes" className="text-amber-600 hover:text-amber-800">← Back to Recipes</Link>
      </div>
    );
  }

  const isOwner = currentUser && recipe.creatorUID === currentUser.uid;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <Link to="/recipes" className="text-amber-600 hover:text-amber-800">← Back to Recipes</Link>
      </div>
      
      {/* Recipe Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif mb-2">{recipe.title}</h1>
        <p className="text-gray-600 mb-4">{recipe.versionTag}</p>
        <p className="text-gray-500">Created by {recipe.creatorName}</p>
      </div>
      
      {/* Recipe Photo */}
      {recipe.photoURL && (
        <div className="mb-8">
          <img 
            src={recipe.photoURL} 
            alt={recipe.title} 
            className="w-full max-h-96 object-cover rounded-lg"
          />
        </div>
      )}
      
      {/* Ingredients */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif mb-4">Ingredients</h2>
        <ul className="list-disc pl-6 space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="text-gray-700">{ingredient}</li>
          ))}
        </ul>
      </div>
      
      {/* Steps */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif mb-4">Instructions</h2>
        <ol className="list-decimal pl-6 space-y-4">
          {recipe.steps.map((step, index) => (
            <li key={index} className="text-gray-700">{step}</li>
          ))}
        </ol>
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
      
      {/* Action Buttons */}
      {isOwner && (
        <div className="flex justify-end space-x-4 mt-8">
          <Link 
            to={`/edit-recipe/${recipe.id}`}
            className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition duration-200"
          >
            Edit Recipe
          </Link>
          
          {!showDeleteConfirm ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
              Delete Recipe
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-red-600">Are you sure?</span>
              <button 
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Yes, Delete
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Comments Section Placeholder */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-serif mb-4">Comments & Memories</h2>
        <p className="text-gray-600 italic">Comments feature coming soon...</p>
      </div>
    </div>
  );
}
