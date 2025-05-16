import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sign up function
  async function signup(email, password, displayName) {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        displayName: displayName,
        createdAt: new Date(),
        familyGroups: []
      });
      
      return userCredential.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      setError('');
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    setError('');
    return signOut(auth);
  }

  // Reset password
  function resetPassword(email) {
    setError('');
    return sendPasswordResetEmail(auth, email);
  }

  // Create or join family group
  async function createFamilyGroup(groupName) {
    if (!currentUser) throw new Error('You must be logged in to create a family group');
    
    try {
      const groupId = Date.now().toString();
      
      // Create the family group document
      await setDoc(doc(db, "familyGroups", groupId), {
        name: groupName,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        members: [currentUser.uid]
      });
      
      // Update user's document with the new family group
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedFamilyGroups = [...(userData.familyGroups || []), groupId];
        
        await setDoc(userRef, {
          ...userData,
          familyGroups: updatedFamilyGroups
        });
      }
      
      return groupId;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Join existing family group
  async function joinFamilyGroup(groupId) {
    if (!currentUser) throw new Error('You must be logged in to join a family group');
    
    try {
      // Get the family group document
      const groupRef = doc(db, "familyGroups", groupId);
      const groupDoc = await getDoc(groupRef);
      
      if (!groupDoc.exists()) {
        throw new Error('Family group not found');
      }
      
      const groupData = groupDoc.data();
      
      // Add user to the family group
      if (!groupData.members.includes(currentUser.uid)) {
        await setDoc(groupRef, {
          ...groupData,
          members: [...groupData.members, currentUser.uid]
        });
      }
      
      // Update user's document with the new family group
      const userRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedFamilyGroups = [...(userData.familyGroups || [])];
        
        if (!updatedFamilyGroups.includes(groupId)) {
          updatedFamilyGroups.push(groupId);
          
          await setDoc(userRef, {
            ...userData,
            familyGroups: updatedFamilyGroups
          });
        }
      }
      
      return groupId;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    createFamilyGroup,
    joinFamilyGroup,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
