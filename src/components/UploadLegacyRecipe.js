import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

export default function UploadLegacyRecipe() {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Handle image upload
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      return setError('Please upload an image of the recipe');
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Upload image
      const imageRef = ref(storage, `legacyRecipes/${currentUser.uid}/${uuidv4()}`);
      await uploadBytes(imageRef, image);
      const imageURL = await getDownloadURL(imageRef);
      
      // Create legacy recipe document
      await addDoc(collection(db, 'legacyRecipes'), {
        title,
        notes,
        imageURL,
        uploaderName: currentUser.displayName || 'Anonymous',
        uploaderUID: currentUser.uid,
        familyGroupID: 'default', // This would be replaced with actual family group ID
        uploadedAt: serverTimestamp()
      });
      
      // Reset form
      setTitle('');
      setNotes('');
      setImage(null);
      setImagePreview('');
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      setError('Failed to upload legacy recipe: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center mb-6">Upload Legacy Recipe</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Legacy recipe uploaded successfully!</div>}
      
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
            placeholder="Grandma's Apple Pie"
          />
        </div>
        
        {/* Notes */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="notes">
            Notes or Description
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows="3"
            placeholder="This recipe was passed down from my grandmother who learned it from her mother in the 1930s..."
          />
        </div>
        
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="image">
            Upload Recipe Image
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload a photo or scan of the handwritten recipe card or page
          </p>
          
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Recipe preview" className="max-w-full h-auto rounded-md border border-gray-300" />
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-200"
        >
          {loading ? 'Uploading...' : 'Upload Legacy Recipe'}
        </button>
      </form>
    </div>
  );
}
