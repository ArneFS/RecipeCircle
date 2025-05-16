import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

export default function CommentSection() {
  const { recipeId } = useParams();
  const { currentUser } = useAuth();
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch comments
  useEffect(() => {
    async function fetchComments() {
      try {
        const commentsRef = collection(db, 'recipes', recipeId, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const commentsList = [];
        querySnapshot.forEach((doc) => {
          commentsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setComments(commentsList);
      } catch (error) {
        setError('Failed to load comments: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (recipeId) {
      fetchComments();
    }
  }, [recipeId]);

  // Add new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    if (!currentUser) {
      setError('You must be logged in to add a comment');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const commentData = {
        text: newComment,
        userID: currentUser.uid,
        userName: currentUser.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      };
      
      const commentsRef = collection(db, 'recipes', recipeId, 'comments');
      const docRef = await addDoc(commentsRef, commentData);
      
      // Add the new comment to the list
      setComments([
        {
          id: docRef.id,
          ...commentData,
          createdAt: new Date() // Use current date for immediate display
        },
        ...comments
      ]);
      
      setNewComment('');
    } catch (error) {
      setError('Failed to add comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-serif mb-6">Comments & Memories</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="comment">
            Share your thoughts, variations, or memories about this recipe
          </label>
          <textarea
            id="comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            rows="3"
            placeholder="I remember Grandma making this with cinnamon instead of nutmeg..."
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting || !currentUser}
          className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-200"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
        
        {!currentUser && (
          <p className="mt-2 text-sm text-red-600">You must be logged in to comment</p>
        )}
      </form>
      
      {/* Comments List */}
      {loading ? (
        <p className="text-center py-4">Loading comments...</p>
      ) : comments.length === 0 ? (
        <div className="bg-amber-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-amber-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium">{comment.userName}</span>
                <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
