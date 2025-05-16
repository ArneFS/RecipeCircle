import React from 'react';
import { ViewRecipe } from './ViewRecipe';
import { CommentSection } from './CommentSection';

export default function RecipeDetail() {
  return (
    <div>
      <ViewRecipe />
      <CommentSection />
    </div>
  );
}
