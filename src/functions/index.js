// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { FieldValue } = require('firebase-admin/firestore');
const axios = require('axios');

admin.initializeApp();

const db = admin.firestore();

// ==================== KORA PAYMENT CONFIGURATION ====================

const KORA_CONFIG = {
  publicKey: functions.config().kora?.public_key,
  secretKey: functions.config().kora?.secret_key,
  encryptionKey: functions.config().kora?.encryption_key,
  baseUrl: "https://api.kora.com/v1"
};

// Log configuration status (without exposing keys)
console.log('[Kora] Configuration loaded:', {
  publicKeySet: !!KORA_CONFIG.publicKey,
  secretKeySet: !!KORA_CONFIG.secretKey,
  encryptionKeySet: !!KORA_CONFIG.encryptionKey,
  baseUrl: KORA_CONFIG.baseUrl
});

// ==================== KORA PAYMENT FUNCTIONS ====================

// Initialize Kora Payment
exports.initializeKoraPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  // Check if Kora is configured
  if (!KORA_CONFIG.publicKey || !KORA_CONFIG.secretKey) {
    console.error('[Kora] Missing API keys - please configure with: firebase functions:config:set kora.public_key=... kora.secret_key=...');
    throw new functions.https.HttpsError('failed-precondition', 'Payment service not configured. Please contact support.');
  }

  const { amount, coins, reference, redirectUrl } = data;
  const userId = context.auth.uid;
  const userEmail = context.auth.token.email;
  const userName = context.auth.token.name || context.auth.token.email?.split('@')[0] || 'User';
  
  try {
    console.log('[Kora] Initializing payment for user:', userId);
    console.log('[Kora] Amount:', amount, 'Coins:', coins, 'Reference:', reference);
    
    const paymentData = {
      amount: amount,
      currency: "NGN",
      reference: reference,
      customer: {
        email: userEmail,
        name: userName,
      },
      metadata: {
        userId: userId,
        coins: coins,
        type: 'coin_purchase'
      },
      redirect_url: `${redirectUrl}/payment-callback`,
      channels: ["card", "bank_transfer", "ussd", "qr"]
    };

    const response = await axios.post(
      `${KORA_CONFIG.baseUrl}/payments/initialize`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KORA_CONFIG.secretKey}`,
          'x-api-key': KORA_CONFIG.publicKey
        },
        timeout: 30000
      }
    );

    const result = response.data;
    console.log('[Kora] Payment init response:', result.status);

    if (result.status === 'success' && result.data.payment_url) {
      // Save transaction to Firestore
      const transactionRef = db
        .collection('users')
        .doc(userId)
        .collection('transactions')
        .doc(reference);
      
      await transactionRef.set({
        type: 'purchase',
        amountNGN: amount,
        coins: coins,
        description: `Purchase of ${coins} WE CONNECT Coins`,
        status: 'pending',
        reference: reference,
        paymentMethod: 'Kora',
        timestamp: FieldValue.serverTimestamp(),
        koraPaymentId: result.data.payment_id
      });

      return {
        success: true,
        paymentUrl: result.data.payment_url,
        paymentId: result.data.payment_id
      };
    } else {
      throw new Error(result.message || 'Payment initialization failed');
    }
  } catch (error) {
    console.error('[Kora] Payment initialization error:', error.message);
    if (error.response) {
      console.error('[Kora] Error response:', error.response.data);
    }
    throw new functions.https.HttpsError('internal', error.message || 'Payment initialization failed');
  }
});

// Verify Kora Payment
exports.verifyKoraPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { reference } = data;
  const userId = context.auth.uid;
  
  try {
    console.log('[Kora] Verifying payment:', reference);
    
    const response = await axios.get(
      `${KORA_CONFIG.baseUrl}/payments/verify/${reference}`,
      {
        headers: {
          'Authorization': `Bearer ${KORA_CONFIG.secretKey}`,
          'x-api-key': KORA_CONFIG.publicKey
        },
        timeout: 30000
      }
    );

    const result = response.data;
    console.log('[Kora] Verification response status:', result.status);

    if (result.status === 'success') {
      const paymentStatus = result.data.status;
      
      if (paymentStatus === 'success') {
        // Get the transaction
        const transactionRef = db
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(reference);
        
        const transactionDoc = await transactionRef.get();
        
        if (transactionDoc.exists && transactionDoc.data().status === 'pending') {
          const transactionData = transactionDoc.data();
          
          // Update user's coins in transaction
          const userRef = db.collection('users').doc(userId);
          await db.runTransaction(async (t) => {
            const userDoc = await t.get(userRef);
            const currentCoins = userDoc.data()?.coins || 0;
            t.update(userRef, { coins: currentCoins + transactionData.coins });
          });
          
          // Update transaction record
          await transactionRef.update({
            status: 'completed',
            completedAt: FieldValue.serverTimestamp(),
            koraVerificationData: result.data
          });
          
          return { success: true, message: 'Payment verified and coins added' };
        } else if (transactionDoc.exists && transactionDoc.data().status === 'completed') {
          return { success: true, message: 'Payment already processed' };
        }
      } else if (paymentStatus === 'pending') {
        return { success: false, pending: true, message: 'Payment still pending' };
      } else {
        // Update failed transaction
        const transactionRef = db
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(reference);
        
        await transactionRef.update({
          status: 'failed',
          failedAt: FieldValue.serverTimestamp(),
          failureReason: paymentStatus
        });
        
        return { success: false, status: paymentStatus, message: `Payment ${paymentStatus}` };
      }
    }
    
    return { success: false, message: 'Verification failed' };
  } catch (error) {
    console.error('[Kora] Payment verification error:', error.message);
    if (error.response) {
      console.error('[Kora] Error response:', error.response.data);
    }
    throw new functions.https.HttpsError('internal', error.message || 'Payment verification failed');
  }
});

// Process Kora Withdrawal
exports.processKoraWithdrawal = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { amount, diamonds, withdrawalMethod, withdrawalDetails } = data;
  const userId = context.auth.uid;
  const reference = `WC_WD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log('[Kora] Processing withdrawal for user:', userId);
    console.log('[Kora] Amount:', amount, 'Diamonds:', diamonds);
    
    const withdrawalData = {
      amount: amount,
      currency: "NGN",
      reference: reference,
      destination: {
        type: withdrawalMethod === 'bank' ? 'bank_account' : 'mobile_money',
        bank_code: withdrawalMethod === 'bank' ? withdrawalDetails.bankCode : null,
        account_number: withdrawalMethod === 'bank' ? withdrawalDetails.accountNumber : withdrawalDetails.mobileNumber,
        account_name: withdrawalDetails.accountName,
        bank_name: withdrawalMethod === 'bank' ? withdrawalDetails.bankName : null,
        provider: withdrawalMethod === 'mobile' ? withdrawalDetails.fintechName : null
      },
      metadata: {
        userId: userId,
        diamonds: diamonds,
        type: 'diamond_withdrawal'
      }
    };

    const response = await axios.post(
      `${KORA_CONFIG.baseUrl}/transactions/transfer`,
      withdrawalData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KORA_CONFIG.secretKey}`,
          'x-api-key': KORA_CONFIG.publicKey
        },
        timeout: 30000
      }
    );

    const result = response.data;
    console.log('[Kora] Withdrawal response:', result.status);

    if (result.status === 'success') {
      // Deduct diamonds from user's wallet
      const userRef = db.collection('users').doc(userId);
      await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        const currentDiamonds = userDoc.data()?.diamonds || 0;
        
        if (currentDiamonds < diamonds) {
          throw new Error('Insufficient diamonds');
        }
        
        t.update(userRef, { diamonds: currentDiamonds - diamonds });
      });
      
      // Add withdrawal transaction
      await db
        .collection('users')
        .doc(userId)
        .collection('transactions')
        .add({
          type: 'withdrawal',
          amountNGN: amount,
          description: `Withdrawal of ₦${amount.toLocaleString()} (${diamonds} diamonds)`,
          status: 'completed',
          timestamp: FieldValue.serverTimestamp(),
          diamondsUsed: diamonds,
          reference: reference,
          withdrawalDetails: withdrawalDetails,
          koraReference: result.data.reference,
          paymentMethod: 'Kora'
        });
      
      return {
        success: true,
        message: 'Withdrawal initiated successfully',
        reference: result.data.reference
      };
    } else {
      throw new Error(result.message || 'Withdrawal failed');
    }
  } catch (error) {
    console.error('[Kora] Withdrawal error:', error.message);
    if (error.response) {
      console.error('[Kora] Error response:', error.response.data);
    }
    throw new functions.https.HttpsError('internal', error.message || 'Withdrawal failed');
  }
});

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
    
    const userRef = db.collection('profiles').doc(targetUserId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const userData = userDoc.data();
    
    const followingRef = db.collection('users').doc(currentUserId).collection('following').doc(targetUserId);
    batch.set(followingRef, {
      followedAt: FieldValue.serverTimestamp(),
      userName: userData.name || 'User',
      userPhoto: userData.photoURL || null,
      userRole: userData.role || 'student'
    });
    
    const followerRef = db.collection('users').doc(targetUserId).collection('followers').doc(currentUserId);
    batch.set(followerRef, {
      followedAt: FieldValue.serverTimestamp(),
      userName: context.auth.token.name || context.auth.token.email?.split('@')[0] || 'Someone',
      userPhoto: context.auth.token.picture || null,
      userRole: userData.role || 'student'
    });
    
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
    const profileRef = db.collection('profiles').doc(userId);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    
    const profile = profileDoc.data();
    
    const materialsRef = db.collection('materials');
    const materialsQuery = await materialsRef.where('uid', '==', userId).get();
    const totalUploads = materialsQuery.size;
    const totalDownloads = materialsQuery.docs.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
    const avgRating = materialsQuery.docs.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (totalUploads || 1);
    
    const followersRef = db.collection('users').doc(userId).collection('followers');
    const followersSnap = await followersRef.get();
    const followersCount = followersSnap.size;
    
    const followingRef = db.collection('users').doc(userId).collection('following');
    const followingSnap = await followingRef.get();
    const followingCount = followingSnap.size;
    
    await profileRef.update({
      profileViews: FieldValue.increment(1),
      lastActive: FieldValue.serverTimestamp()
    });
    
    const recentMaterials = materialsQuery.docs
      .sort((a, b) => b.data().createdAt - a.data().createdAt)
      .slice(0, 6)
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
    
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
    const followingRef = db.collection('users').doc(userId).collection('following');
    const followingSnap = await followingRef.get();
    const followingIds = followingSnap.docs.map(doc => doc.id);
    
    if (followingIds.length === 0) {
      return { materials: [] };
    }
    
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
    try {
      const uploaderRef = db.collection('profiles').doc(uploaderId);
      const uploaderDoc = await uploaderRef.get();
      const uploaderName = uploaderDoc.exists ? uploaderDoc.data().name : 'Someone';
      
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