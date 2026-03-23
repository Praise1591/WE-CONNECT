// services/socialService.js
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// ==================== FOLLOW SYSTEM ====================

/**
 * Follow a user
 * @param {string} targetUserId - ID of the user to follow
 * @returns {Promise<Object>} - Result of the operation
 */
export const followUser = async (targetUserId) => {
  try {
    const followFn = httpsCallable(functions, 'followUser');
    const result = await followFn({ targetUserId });
    return result.data;
  } catch (error) {
    console.error('Follow user error:', error);
    throw error;
  }
};

/**
 * Unfollow a user
 * @param {string} targetUserId - ID of the user to unfollow
 * @returns {Promise<Object>} - Result of the operation
 */
export const unfollowUser = async (targetUserId) => {
  try {
    const unfollowFn = httpsCallable(functions, 'unfollowUser');
    const result = await unfollowFn({ targetUserId });
    return result.data;
  } catch (error) {
    console.error('Unfollow user error:', error);
    throw error;
  }
};

/**
 * Check if current user is following a specific user
 * @param {string} targetUserId - ID of the user to check
 * @returns {Promise<boolean>} - True if following, false otherwise
 */
export const checkFollowingStatus = async (targetUserId) => {
  try {
    const { auth } = await import('../firebase');
    const user = auth.currentUser;
    
    if (!user) return false;
    
    const followRef = doc(db, 'users', user.uid, 'following', targetUserId);
    const followDoc = await getDoc(followRef);
    return followDoc.exists();
  } catch (error) {
    console.error('Check following status error:', error);
    return false;
  }
};

// ==================== PROFILE SYSTEM ====================

/**
 * Get user profile with stats
 * @param {string} userId - ID of the user
 * @returns {Promise<Object>} - User profile data with stats
 */
export const getUserProfile = async (userId) => {
  try {
    const getProfileFn = httpsCallable(functions, 'getUserProfile');
    const result = await getProfileFn({ userId });
    return result.data;
  } catch (error) {
    console.error('Get user profile error:', error);
    
    // Fallback to direct Firestore query if function fails
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(profileRef);
      
      if (!profileDoc.exists()) {
        throw new Error('User not found');
      }
      
      const profile = profileDoc.data();
      
      // Get materials stats
      const materialsRef = collection(db, 'materials');
      const materialsQuery = query(materialsRef, where('uid', '==', userId));
      const materialsSnap = await getDocs(materialsQuery);
      const totalUploads = materialsSnap.size;
      const totalDownloads = materialsSnap.docs.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
      const avgRating = materialsSnap.docs.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (totalUploads || 1);
      
      // Get followers count
      const followersRef = collection(db, 'users', userId, 'followers');
      const followersSnap = await getDocs(followersRef);
      const followersCount = followersSnap.size;
      
      // Get following count
      const followingRef = collection(db, 'users', userId, 'following');
      const followingSnap = await getDocs(followingRef);
      const followingCount = followingSnap.size;
      
      // Get recent materials
      const recentMaterials = materialsSnap.docs
        .sort((a, b) => {
          const dateA = a.data().createdAt?.toDate?.() || new Date(0);
          const dateB = b.data().createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        })
        .slice(0, 6)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
      
      return {
        profile: {
          ...profile,
          id: userId,
          joinedDate: profile.createdAt?.toDate?.() || new Date(),
          lastActive: profile.lastActive?.toDate?.() || new Date(),
          stats: {
            totalUploads,
            totalDownloads,
            averageRating: avgRating,
            followers: followersCount,
            following: followingCount,
            profileViews: profile.profileViews || 0
          },
          recentMaterials,
          isFollowing: false // Will be checked separately
        }
      };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      throw error;
    }
  }
};

// ==================== ACTIVITY SYSTEM ====================

/**
 * Get user's recent activity
 * @param {string} userId - ID of the user
 * @param {number} limit - Number of activities to fetch
 * @returns {Promise<Array>} - List of activities
 */
export const getUserActivity = async (userId, limit = 20) => {
  try {
    const getActivityFn = httpsCallable(functions, 'getUserActivity');
    const result = await getActivityFn({ userId, limit });
    return result.data;
  } catch (error) {
    console.error('Get user activity error:', error);
    
    // Fallback to direct Firestore query
    try {
      const materialsRef = collection(db, 'materials');
      const q = query(
        materialsRef,
        where('uid', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      const snapshot = await getDocs(q);
      
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        type: 'upload',
        title: doc.data().title,
        category: doc.data().category,
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        action: `uploaded a new ${doc.data().category || 'material'}`
      }));
      
      return { activities };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return { activities: [] };
    }
  }
};

// ==================== FOLLOWERS/FOLLOWING SYSTEM ====================

/**
 * Get user's followers
 * @param {string} userId - ID of the user
 * @param {number} limit - Number of followers to fetch
 * @param {string|null} startAfter - Document ID to start after for pagination
 * @returns {Promise<Object>} - List of followers and pagination info
 */
export const getFollowers = async (userId, limit = 20, startAfter = null) => {
  try {
    const getFollowersFn = httpsCallable(functions, 'getFollowers');
    const result = await getFollowersFn({ userId, limit, startAfter });
    return result.data;
  } catch (error) {
    console.error('Get followers error:', error);
    
    // Fallback to direct Firestore query
    try {
      let followersQuery = collection(db, 'users', userId, 'followers');
      let q = query(followersQuery, orderBy('followedAt', 'desc'), limit(limit));
      
      if (startAfter) {
        const startAfterDoc = await getDoc(doc(followersQuery, startAfter));
        q = query(q, startAfter(startAfterDoc));
      }
      
      const snapshot = await getDocs(q);
      const followers = [];
      
      for (const docSnap of snapshot.docs) {
        const followerData = docSnap.data();
        const profileRef = doc(db, 'profiles', docSnap.id);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          followers.push({
            id: docSnap.id,
            ...profileDoc.data(),
            followedAt: followerData.followedAt?.toDate?.() || new Date()
          });
        }
      }
      
      return {
        followers,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
      };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return { followers: [], lastVisible: null };
    }
  }
};

/**
 * Get users that a user is following
 * @param {string} userId - ID of the user
 * @param {number} limit - Number of following to fetch
 * @param {string|null} startAfter - Document ID to start after for pagination
 * @returns {Promise<Object>} - List of following and pagination info
 */
export const getFollowing = async (userId, limit = 20, startAfter = null) => {
  try {
    const getFollowingFn = httpsCallable(functions, 'getFollowing');
    const result = await getFollowingFn({ userId, limit, startAfter });
    return result.data;
  } catch (error) {
    console.error('Get following error:', error);
    
    // Fallback to direct Firestore query
    try {
      let followingQuery = collection(db, 'users', userId, 'following');
      let q = query(followingQuery, orderBy('followedAt', 'desc'), limit(limit));
      
      if (startAfter) {
        const startAfterDoc = await getDoc(doc(followingQuery, startAfter));
        q = query(q, startAfter(startAfterDoc));
      }
      
      const snapshot = await getDocs(q);
      const following = [];
      
      for (const docSnap of snapshot.docs) {
        const followingData = docSnap.data();
        const profileRef = doc(db, 'profiles', docSnap.id);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          following.push({
            id: docSnap.id,
            ...profileDoc.data(),
            followedAt: followingData.followedAt?.toDate?.() || new Date()
          });
        }
      }
      
      return {
        following,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
      };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return { following: [], lastVisible: null };
    }
  }
};

// ==================== SEARCH SYSTEM ====================

/**
 * Search for users
 * @param {string} searchTerm - Search term
 * @param {string} role - Filter by role (all, student, tutor, lecturer)
 * @param {string} school - Filter by school
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Array>} - List of matching users
 */
export const searchUsers = async (searchTerm = '', role = 'all', school = '', limit = 20) => {
  try {
    const searchFn = httpsCallable(functions, 'searchUsers');
    const result = await searchFn({ searchTerm, role, school, limit });
    return result.data.users;
  } catch (error) {
    console.error('Search users error:', error);
    
    // Fallback to direct Firestore query
    try {
      let usersQuery = collection(db, 'profiles');
      let constraints = [];
      
      if (role && role !== 'all') {
        constraints.push(where('role', '==', role));
      }
      
      if (school) {
        constraints.push(where('school', '==', school));
      }
      
      let q = query(usersQuery, ...constraints, limit(limit));
      const snapshot = await getDocs(q);
      const results = [];
      const searchLower = searchTerm?.toLowerCase() || '';
      
      snapshot.forEach((doc) => {
        const userData = doc.data();
        const matches = !searchTerm || 
          userData.name?.toLowerCase().includes(searchLower) ||
          userData.email?.toLowerCase().includes(searchLower) ||
          userData.school?.toLowerCase().includes(searchLower) ||
          userData.department?.toLowerCase().includes(searchLower);
        
        if (matches) {
          results.push({
            id: doc.id,
            ...userData
          });
        }
      });
      
      return results;
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return [];
    }
  }
};

// ==================== FEED SYSTEM ====================

/**
 * Get feed (materials from followed users)
 * @param {number} limit - Number of items to fetch
 * @param {string|null} startAfter - Document ID to start after for pagination
 * @returns {Promise<Object>} - Feed items and pagination info
 */
export const getFeed = async (limit = 20, startAfter = null) => {
  try {
    const getFeedFn = httpsCallable(functions, 'getFeed');
    const result = await getFeedFn({ limit, startAfter });
    return result.data;
  } catch (error) {
    console.error('Get feed error:', error);
    
    // Fallback: Get materials from users the current user follows
    try {
      const { auth } = await import('../firebase');
      const user = auth.currentUser;
      
      if (!user) return { materials: [], lastVisible: null };
      
      // Get users that current user follows
      const followingRef = collection(db, 'users', user.uid, 'following');
      const followingSnap = await getDocs(followingRef);
      const followingIds = followingSnap.docs.map(doc => doc.id);
      
      if (followingIds.length === 0) {
        return { materials: [], lastVisible: null };
      }
      
      // Get materials from followed users
      const materialsRef = collection(db, 'materials');
      let q = query(
        materialsRef,
        where('uid', 'in', followingIds),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      if (startAfter) {
        const startAfterDoc = await getDoc(doc(materialsRef, startAfter));
        q = query(q, startAfter(startAfterDoc));
      }
      
      const snapshot = await getDocs(q);
      const materials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      return {
        materials,
        lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
      };
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return { materials: [], lastVisible: null };
    }
  }
};

// ==================== NOTIFICATION SYSTEM ====================

/**
 * Get user's notifications
 * @param {string} userId - ID of the user
 * @param {number} limit - Number of notifications to fetch
 * @returns {Promise<Array>} - List of notifications
 */
export const getNotifications = async (userId, limit = 50) => {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(limit));
    const snapshot = await getDocs(q);
    
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    
    return notifications;
  } catch (error) {
    console.error('Get notifications error:', error);
    return [];
  }
};

/**
 * Mark notification as read
 * @param {string} userId - ID of the user
 * @param {string} notificationId - ID of the notification
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
  }
};