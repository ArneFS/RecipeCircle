import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function JoinFamilyGroup() {
  const [groupId, setGroupId] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  
  const { joinFamilyGroup } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await joinFamilyGroup(groupId);
      setSuccess(true);
      setGroupId('');
    } catch (error) {
      setError('Failed to join family group: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center mb-6">Join a Family Group</h2>
      
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">Successfully joined family group!</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label className="block text-gray-700 mb-2" htmlFor="groupId">
            Family Group ID
          </label>
          <input
            id="groupId"
            type="text"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            required
            placeholder="Enter the group ID shared with you"
          />
          <p className="text-sm text-gray-500 mt-1">
            Ask your family member for the group ID they created.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition duration-200"
        >
          {loading ? 'Joining...' : 'Join Family Group'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Want to create a new group? <Link to="/create-family-group" className="text-amber-600 hover:text-amber-800">Create Family Group</Link>
        </p>
      </div>
    </div>
  );
}
