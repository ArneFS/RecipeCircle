import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

export default function EditRecipe() {
  const { recipeId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [notes, setNotes] = useState('');
  const [versionTag, setVersionTag] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch recipe data
  useEffect(() => {
    async function fetchRecipe() {
      try {
        const recipeRef = doc(db, 'recipes', recipeId);
        const recipeSnap = await getDoc(recipeRef);
        
        if (recipeSnap.exists()) {
          const recipeData = recipeSnap.data();
          
          // Check if user is the creator
          if (recipeData.creatorUID !== currentUser.uid) {
            setError('You do not have permission to edit this recipe');
            setLoading(false);
            return;
          }
          
          setTitle(recipeData.title || '');
          setIngredients(recipeData.ingredients || ['']);
          setSteps(recipeData.steps || ['']);
          setNotes(recipeData.notes || '');
          setVersionTag(recipeData.versionTag || '');
          setPhotoURL(recipeData.photoURL || '');
          
          if (recipeData.photoURL) {
            setPhotoPreview(recipeData.photoURL);
          }
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
  }, [recipeId, currentUser]);

  // Handle ingredient input changes
  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  // Add new ingredient input field
  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  // Remove ingredient input field
  const removeIngredientField = (index) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };

  // Handle step input changes
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  // Add new step input field
  const addStepField = () => {
    setSteps([...steps, '']);
  };

  // Remove step input field
  const removeStepField = (index) => {
    if (steps.length > 1) {
      const newSteps = [...steps];
      newSteps.splice(index, 1);
      setSteps(newSteps);
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filter out empty ingredients and steps
    const filteredIngredients = ingredients.filter(item => item.trim() !== '');
    const filteredSteps = steps.filter(item => item.trim() !== '');
    
    if (filteredIngredients.length === 0 || filteredSteps.length === 0) {
      return setError('Please add at least one ingredient and one step');
    }
    
    try {
      setSaving(true);
      setError('');
      
      // Upload new photo if provided
      let updatedPhotoURL = photoURL;
      if (photo) {
        const photoRef = ref(storage, `recipes/${currentUser.uid}/${uuidv4()}`);
        await uploadBytes(photoRef, photo);
        updatedPhotoURL = await getDownloadURL(photoRef);
      }
      
      // Update recipe document
      const recipeRef = doc(db, 'recipes', recipeId);
      await updateDoc(recipeRef, {
        title,
        ingredients: filteredIngredients,
        steps: filteredSteps,
        notes,
        versionTag,
        photoURL: updatedPhotoURL,
        updatedAt: serverTimestamp()
      });
      
      setSuccess(true);
      
      // Navigate back to recipe view after short delay
      setTimeout(() => {
        navigate(`/recipe/${recipeId}`);
      }, 1500);
      
    } catch (error) {
      setError('Failed to update recipe: ' + error.message);
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading recipe...</div>;
  }

  if (error && error.includes('permission')) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        <button
          onClick={() => navigate('/recipes')}
          className="text-amber-600 hover:text-amber-800"
        >
          ← Back to Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center mb-6">Edit Recipe</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Recipe updated successfully!</div>}
      
      <form onSubmit={handleSubmit}>
        {/* Recipe Title */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="title">
            Recipe Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>
        
        {/* Ingredients */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Ingredients
          </label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={`Ingredient ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeIngredientField(index)}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={ingredients.length <= 1}
              >
                -
              </button>
              {index === ingredients.length - 1 && (
                <button
                  type="button"
                  onClick={addIngredientField}
                  className="ml-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Steps */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">
            Steps
          </label>
          {steps.map((step, index) => (
            <div key={index} className="flex mb-2">
              <textarea
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder={`Step ${index + 1}`}
                rows="2"
              />
              <button
                type="button"
                onClick={() => removeStepField(index)}
                className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                disabled={steps.length <= 1}
              >
                -
              </button>
              {index === steps.length - 1 && (
                <button
                  type="button"
                  onClick={addStepField}
                  className="ml-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="notes">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows="3"
          />
        </div>
        
        {/* Version Tag */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="versionTag">
            Version Tag
          </label>
          <input
            id="versionTag"
            type="text"
            value={versionTag}
            onChange={(e) => setVersionTag(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        
        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="photo">
            Photo (Optional)
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {photoPreview && (
            <div className="mt-2">
              <img src={photoPreview} alt="Recipe preview" className="max-h-40 rounded-md" />
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/recipe/${recipeId}`)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-200"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
