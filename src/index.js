// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');

admin.initializeApp();

const db = admin.firestore();

// ==================== USER FOLLOW SYSTEM ====================

// Follow a user
exports.followUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { targetUserId } = data;
  const currentUserId = context.auth.uid;
  
  if (currentUserId === targetUserId) {
    throw new functions.https.HttpsError('invalid-argument', 'You cannot follow yourself');
  }
  
  try {
    const batch = db.batch();
    
    // Check if user exists
    const userRef = db.collection('profiles').doc(targetUserId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const userData = userDoc.data();
    
    // Add to current user's following
    const followingRef = db.collection('users').doc(currentUserId).collection('following').doc(targetUserId);
    batch.set(followingRef, {
      followedAt: FieldValue.serverTimestamp(),
      userName: userData.name || 'User',
      userPhoto: userData.photoURL || null,
      userRole: userData.role || 'student'
    });
    
    // Add to target user's followers
    const followerRef = db.collection('users').doc(targetUserId).collection('followers').doc(currentUserId);
    batch.set(followerRef, {
      followedAt: FieldValue.serverTimestamp(),
      userName: context.auth.token.name || context.auth.token.email?.split('@')[0] || 'Someone',
      userPhoto: context.auth.token.picture || null,
      userRole: userData.role || 'student'
    });
    
    // Create notification
    const notificationRef = db.collection('users').doc(targetUserId).collection('notifications').doc();
    batch.set(notificationRef, {
      type: 'new_follower',
      message: `${context.auth.token.name || context.auth.token.email?.split('@')[0] || 'Someone'} started following you`,
      userId: currentUserId,
      userName: context.auth.token.name || context.auth.token.email?.split('@')[0] || 'Someone',
      userPhoto: context.auth.token.picture || null,
      read: false,
      createdAt: FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    
    // Update follower count in profile
    const profileRef = db.collection('profiles').doc(targetUserId);
    await profileRef.update({
      followers: FieldValue.increment(1)
    });
    
    return { success: true, message: `Now following ${userData.name}` };
    
  } catch (error) {
    console.error('Follow user error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Unfollow a user
exports.unfollowUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { targetUserId } = data;
  const currentUserId = context.auth.uid;
  
  try {
    const batch = db.batch();
    
    const followingRef = db.collection('users').doc(currentUserId).collection('following').doc(targetUserId);
    batch.delete(followingRef);
    
    const followerRef = db.collection('users').doc(targetUserId).collection('followers').doc(currentUserId);
    batch.delete(followerRef);
    
    await batch.commit();
    
    // Update follower count in profile
    const profileRef = db.collection('profiles').doc(targetUserId);
    await profileRef.update({
      followers: FieldValue.increment(-1)
    });
    
    return { success: true, message: 'Unfollowed successfully' };
    
  } catch (error) {
    console.error('Unfollow user error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get user's followers
exports.getFollowers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { userId, limit = 20, startAfter } = data;
  
  try {
    let query = db.collection('users').doc(userId).collection('followers')
      .orderBy('followedAt', 'desc')
      .limit(limit);
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    
    const snapshot = await query.get();
    const followers = [];
    
    for (const doc of snapshot.docs) {
      const followerData = doc.data();
      const profileRef = db.collection('profiles').doc(doc.id);
      const profileDoc = await profileRef.get();
      
      if (profileDoc.exists) {
        followers.push({
          id: doc.id,
          ...profileDoc.data(),
          followedAt: followerData.followedAt
        });
      }
    }
    
    return {
      followers,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
    };
    
  } catch (error) {
    console.error('Get followers error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get user's following
exports.getFollowing = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { userId, limit = 20, startAfter } = data;
  
  try {
    let query = db.collection('users').doc(userId).collection('following')
      .orderBy('followedAt', 'desc')
      .limit(limit);
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    
    const snapshot = await query.get();
    const following = [];
    
    for (const doc of snapshot.docs) {
      const followingData = doc.data();
      const profileRef = db.collection('profiles').doc(doc.id);
      const profileDoc = await profileRef.get();
      
      if (profileDoc.exists) {
        following.push({
          id: doc.id,
          ...profileDoc.data(),
          followedAt: followingData.followedAt
        });
      }
    }
    
    return {
      following,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
    };
    
  } catch (error) {
    console.error('Get following error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Search users
exports.searchUsers = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { searchTerm, role, school, limit = 20 } = data;
  
  try {
    let query = db.collection('profiles');
    
    // Apply filters
    if (role && role !== 'all') {
      query = query.where('role', '==', role);
    }
    
    if (school) {
      query = query.where('school', '==', school);
    }
    
    const snapshot = await query.limit(limit).get();
    const results = [];
    const searchLower = searchTerm?.toLowerCase() || '';
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      const matches = !searchTerm || 
        userData.name?.toLowerCase().includes(searchLower) ||
        userData.email?.toLowerCase().includes(searchLower) ||
        userData.school?.toLowerCase().includes(searchLower) ||
        userData.department?.toLowerCase().includes(searchLower);
      
      if (matches && doc.id !== context.auth.uid) {
        results.push({
          id: doc.id,
          ...userData
        });
      }
    });
    
    // Sort by relevance
    results.sort((a, b) => {
      const aNameMatch = a.name?.toLowerCase().includes(searchLower);
      const bNameMatch = b.name?.toLowerCase().includes(searchLower);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return (b.followers || 0) - (a.followers || 0);
    });
    
    return { users: results };
    
  } catch (error) {
    console.error('Search users error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get user profile with stats
exports.getUserProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { userId } = data;
  
  try {
    // Get profile
    const profileRef = db.collection('profiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const profile = profileDoc.data();
    
    // Get stats
    const materialsRef = db.collection('materials');
    const materialsQuery = await materialsRef.where('uid', '==', userId).get();
    const totalUploads = materialsQuery.size;
    const totalDownloads = materialsQuery.docs.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
    const avgRating = materialsQuery.docs.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (totalUploads || 1);
    
    // Get followers count
    const followersRef = db.collection('users').doc(userId).collection('followers');
    const followersSnap = await followersRef.get();
    const followersCount = followersSnap.size;
    
    // Get following count
    const followingRef = db.collection('users').doc(userId).collection('following');
    const followingSnap = await followingRef.get();
    const followingCount = followingSnap.size;
    
    // Increment profile views
    await profileRef.update({
      profileViews: FieldValue.increment(1),
      lastActive: FieldValue.serverTimestamp()
    });
    
    // Get recent materials
    const recentMaterials = materialsQuery.docs
      .sort((a, b) => b.data().createdAt - a.data().createdAt)
      .slice(0, 6)
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
    
    // Check if current user follows this profile
    let isFollowing = false;
    if (context.auth.uid !== userId) {
      const followRef = db.collection('users').doc(context.auth.uid).collection('following').doc(userId);
      const followDoc = await followRef.get();
      isFollowing = followDoc.exists;
    }
    
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
          following: followingCount
        },
        recentMaterials,
        isFollowing
      }
    };
    
  } catch (error) {
    console.error('Get user profile error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get user's recent activity
exports.getUserActivity = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { userId, limit = 20 } = data;
  
  try {
    const materialsRef = db.collection('materials');
    const snapshot = await materialsRef
      .where('uid', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      type: 'upload',
      title: doc.data().title,
      category: doc.data().category,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      action: `uploaded a new ${doc.data().category || 'material'}`
    }));
    
    return { activities };
    
  } catch (error) {
    console.error('Get user activity error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Get feed (materials from followed users)
exports.getFeed = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }
  
  const { limit = 20, startAfter } = data;
  const userId = context.auth.uid;
  
  try {
    // Get users that current user follows
    const followingRef = db.collection('users').doc(userId).collection('following');
    const followingSnap = await followingRef.get();
    const followingIds = followingSnap.docs.map(doc => doc.id);
    
    if (followingIds.length === 0) {
      return { materials: [] };
    }
    
    // Get materials from followed users
    let query = db.collection('materials')
      .where('uid', 'in', followingIds)
      .orderBy('createdAt', 'desc')
      .limit(limit);
    
    if (startAfter) {
      const startAfterDoc = await db.collection('materials').doc(startAfter).get();
      query = query.startAfter(startAfterDoc);
    }
    
    const snapshot = await query.get();
    const materials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));
    
    return {
      materials,
      lastVisible: snapshot.docs[snapshot.docs.length - 1]?.id || null
    };
    
  } catch (error) {
    console.error('Get feed error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Create notification for new material upload
exports.notifyFollowers = functions.firestore
  .document('materials/{materialId}')
  .onCreate(async (snap, context) => {
    const material = snap.data();
    const uploaderId = material.uid;
    
    try {
      // Get uploader's profile
      const uploaderRef = db.collection('profiles').doc(uploaderId);
      const uploaderDoc = await uploaderRef.get();
      const uploaderName = uploaderDoc.exists ? uploaderDoc.data().name : 'Someone';
      
      // Get followers
      const followersRef = db.collection('users').doc(uploaderId).collection('followers');
      const followersSnap = await followersRef.get();
      
      const batch = db.batch();
      
      followersSnap.forEach((followerDoc) => {
        const followerId = followerDoc.id;
        const notificationRef = db.collection('users').doc(followerId).collection('notifications').doc();
        
        batch.set(notificationRef, {
          type: 'new_material',
          message: `${uploaderName} uploaded a new material: "${material.title || 'Untitled'}"`,
          userId: uploaderId,
          userName: uploaderName,
          materialId: snap.id,
          materialTitle: material.title,
          read: false,
          createdAt: FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
      
    } catch (error) {
      console.error('Notify followers error:', error);
    }
  });