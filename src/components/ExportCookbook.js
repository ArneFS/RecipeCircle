import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function ExportCookbook() {
  const { currentUser } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [legacyRecipes, setLegacyRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState({});
  const [selectedLegacyRecipes, setSelectedLegacyRecipes] = useState({});
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch recipes and legacy recipes
  useEffect(() => {
    async function fetchRecipes() {
      if (!currentUser) return;
      
      try {
        // Fetch regular recipes
        const recipesQuery = query(
          collection(db, 'recipes'),
          where('creatorUID', '==', currentUser.uid)
        );
        
        const recipesSnapshot = await getDocs(recipesQuery);
        const recipesList = [];
        
        recipesSnapshot.forEach((doc) => {
          recipesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setRecipes(recipesList);
        
        // Initialize selected state for recipes
        const initialSelectedRecipes = {};
        recipesList.forEach(recipe => {
          initialSelectedRecipes[recipe.id] = false;
        });
        setSelectedRecipes(initialSelectedRecipes);
        
        // Fetch legacy recipes
        const legacyRecipesQuery = query(
          collection(db, 'legacyRecipes'),
          where('uploaderUID', '==', currentUser.uid)
        );
        
        const legacyRecipesSnapshot = await getDocs(legacyRecipesQuery);
        const legacyRecipesList = [];
        
        legacyRecipesSnapshot.forEach((doc) => {
          legacyRecipesList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setLegacyRecipes(legacyRecipesList);
        
        // Initialize selected state for legacy recipes
        const initialSelectedLegacyRecipes = {};
        legacyRecipesList.forEach(recipe => {
          initialSelectedLegacyRecipes[recipe.id] = false;
        });
        setSelectedLegacyRecipes(initialSelectedLegacyRecipes);
        
      } catch (error) {
        setError('Failed to fetch recipes: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecipes();
  }, [currentUser]);

  // Toggle recipe selection
  const toggleRecipeSelection = (id) => {
    setSelectedRecipes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle legacy recipe selection
  const toggleLegacyRecipeSelection = (id) => {
    setSelectedLegacyRecipes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Select all recipes
  const selectAllRecipes = () => {
    const newSelectedRecipes = {};
    recipes.forEach(recipe => {
      newSelectedRecipes[recipe.id] = true;
    });
    setSelectedRecipes(newSelectedRecipes);
  };

  // Deselect all recipes
  const deselectAllRecipes = () => {
    const newSelectedRecipes = {};
    recipes.forEach(recipe => {
      newSelectedRecipes[recipe.id] = false;
    });
    setSelectedRecipes(newSelectedRecipes);
  };

  // Select all legacy recipes
  const selectAllLegacyRecipes = () => {
    const newSelectedLegacyRecipes = {};
    legacyRecipes.forEach(recipe => {
      newSelectedLegacyRecipes[recipe.id] = true;
    });
    setSelectedLegacyRecipes(newSelectedLegacyRecipes);
  };

  // Deselect all legacy recipes
  const deselectAllLegacyRecipes = () => {
    const newSelectedLegacyRecipes = {};
    legacyRecipes.forEach(recipe => {
      newSelectedLegacyRecipes[recipe.id] = false;
    });
    setSelectedLegacyRecipes(newSelectedLegacyRecipes);
  };

  // Generate PDF cookbook
  const generateCookbook = async () => {
    // Check if any recipes are selected
    const hasSelectedRecipes = Object.values(selectedRecipes).some(selected => selected);
    const hasSelectedLegacyRecipes = Object.values(selectedLegacyRecipes).some(selected => selected);
    
    if (!hasSelectedRecipes && !hasSelectedLegacyRecipes) {
      return setError('Please select at least one recipe to include in the cookbook');
    }
    
    try {
      setGenerating(true);
      setError('');
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set font styles
      doc.setFont('times', 'normal');
      
      // Cover Page
      doc.setFontSize(32);
      doc.text('The Family Cookbook', 105, 80, { align: 'center' });
      
      if (familyName) {
        doc.setFontSize(24);
        doc.text(`The ${familyName} Family`, 105, 100, { align: 'center' });
      }
      
      doc.setFontSize(14);
      doc.text(`Created on ${new Date().toLocaleDateString()}`, 105, 120, { align: 'center' });
      
      // Add regular recipes
      if (hasSelectedRecipes) {
        doc.addPage();
        
        // Section Divider
        doc.setFontSize(24);
        doc.setFont('times', 'bold');
        doc.text('Recipes', 105, 20, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Add each selected recipe
        const selectedRecipesList = recipes.filter(recipe => selectedRecipes[recipe.id]);
        
        let yPosition = 40;
        
        for (const recipe of selectedRecipesList) {
          // Check if we need a new page
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Recipe Title
          doc.setFontSize(18);
          doc.setFont('times', 'bold');
          doc.text(recipe.title, 20, yPosition);
          yPosition += 10;
          
          // Version Tag
          doc.setFontSize(12);
          doc.setFont('times', 'italic');
          doc.text(recipe.versionTag || '', 20, yPosition);
          yPosition += 10;
          
          // Ingredients
          doc.setFont('times', 'bold');
          doc.text('Ingredients:', 20, yPosition);
          doc.setFont('times', 'normal');
          yPosition += 8;
          
          recipe.ingredients.forEach(ingredient => {
            doc.text(`• ${ingredient}`, 25, yPosition);
            yPosition += 6;
            
            // Check if we need a new page
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }
          });
          
          yPosition += 5;
          
          // Instructions
          doc.setFont('times', 'bold');
          doc.text('Instructions:', 20, yPosition);
          doc.setFont('times', 'normal');
          yPosition += 8;
          
          recipe.steps.forEach((step, index) => {
            const stepText = `${index + 1}. ${step}`;
            
            // Split long text into multiple lines
            const textLines = doc.splitTextToSize(stepText, 170);
            
            textLines.forEach(line => {
              doc.text(line, 25, yPosition);
              yPosition += 6;
              
              // Check if we need a new page
              if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
              }
            });
            
            yPosition += 2;
          });
          
          // Notes if available
          if (recipe.notes) {
            yPosition += 5;
            doc.setFont('times', 'bold');
            doc.text('Notes:', 20, yPosition);
            doc.setFont('times', 'normal');
            yPosition += 8;
            
            const noteLines = doc.splitTextToSize(recipe.notes, 170);
            
            noteLines.forEach(line => {
              doc.text(line, 25, yPosition);
              yPosition += 6;
              
              // Check if we need a new page
              if (yPosition > 280) {
                doc.addPage();
                yPosition = 20;
              }
            });
          }
          
          // Add page break between recipes
          doc.addPage();
          yPosition = 20;
        }
      }
      
      // Add legacy recipes
      if (hasSelectedLegacyRecipes) {
        // Section Divider
        doc.setFontSize(24);
        doc.setFont('times', 'bold');
        doc.text('Legacy Recipes', 105, 20, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        
        // Add each selected legacy recipe
        const selectedLegacyRecipesList = legacyRecipes.filter(recipe => selectedLegacyRecipes[recipe.id]);
        
        for (const recipe of selectedLegacyRecipesList) {
          // Recipe Title
          doc.setFontSize(18);
          doc.setFont('times', 'bold');
          doc.text(recipe.title, 105, 40, { align: 'center' });
          
          // Notes if available
          if (recipe.notes) {
            doc.setFontSize(12);
            doc.setFont('times', 'normal');
            
            const noteLines = doc.splitTextToSize(recipe.notes, 170);
            let yPosition = 55;
            
            noteLines.forEach(line => {
              doc.text(line, 20, yPosition);
              yPosition += 6;
            });
          }
          
          // Add page break between recipes
          doc.addPage();
        }
      }
      
      // Remove the last empty page
      if (doc.getNumberOfPages() > 1) {
        doc.deletePage(doc.getNumberOfPages());
      }
      
      // Save the PDF
      doc.save(`${familyName ? familyName + '_' : ''}Family_Cookbook.pdf`);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      setError('Failed to generate cookbook: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading recipes...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center mb-6">Create Your Family Cookbook</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Cookbook generated successfully!</div>}
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2" htmlFor="familyName">
          Family Name (Optional)
        </label>
        <input
          id="familyName"
          type="text"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="e.g., Smith"
        />
      </div>
      
      {/* Regular Recipes Selection */}
      {recipes.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif">Select Recipes</h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAllRecipes}
                className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-md transition duration-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllRecipes}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md transition duration-200"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map(recipe => (
              <div 
                key={recipe.id} 
                className={`p-4 border rounded-md cursor-pointer transition duration-200 ${
                  selectedRecipes[recipe.id] ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-300'
                }`}
                onClick={() => toggleRecipeSelection(recipe.id)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedRecipes[recipe.id] || false}
                    onChange={() => toggleRecipeSelection(recipe.id)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h4 className="font-medium">{recipe.title}</h4>
                    <p className="text-sm text-gray-600">{recipe.versionTag}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legacy Recipes Selection */}
      {legacyRecipes.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-serif">Select Legacy Recipes</h3>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAllLegacyRecipes}
                className="text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-md transition duration-200"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAllLegacyRecipes}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md transition duration-200"
              >
                Deselect All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {legacyRecipes.map(recipe => (
              <div 
                key={recipe.id} 
                className={`p-4 border rounded-md cursor-pointer transition duration-200 ${
                  selectedLegacyRecipes[recipe.id] ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-300'
                }`}
                onClick={() => toggleLegacyRecipeSelection(recipe.id)}
              >
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={selectedLegacyRecipes[recipe.id] || false}
                    onChange={() => toggleLegacyRecipeSelection(recipe.id)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h4 className="font-medium">{recipe.title}</h4>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {recipes.length === 0 && legacyRecipes.length === 0 ? (
        <div className="text-center py-8 bg-amber-50 rounded-lg">
          <p className="text-gray-600 mb-4">You don't have any recipes to export yet.</p>
          <p className="text-gray-600">
            <a href="/add-recipe" className="text-amber-600 hover:text-amber-800 underline">Add a recipe</a>
            {' or '}
            <a href="/upload-legacy-recipe" className="text-amber-600 hover:text-amber-800 underline">upload a legacy recipe</a>
            {' first.'}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={generateCookbook}
          disabled={generating}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-200"
        >
          {generating ? 'Generating Cookbook...' : 'Generate PDF Cookbook'}
        </button>
      )}
    </div>
  );
}
