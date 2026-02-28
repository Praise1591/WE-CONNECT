// src/utils/notifications.js
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const createNotification = async (userId, notificationData) => {
  if (!userId) return;

  try {
    const notifCollection = collection(db, `users/${userId}/notifications`);

    await addDoc(notifCollection, {
      ...notificationData,
      read: false,
      createdAt: serverTimestamp(),
    });

    // Optional: trigger UI refresh in other open tabs/windows
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: { userId }
    }));
  } catch (err) {
    console.error("Failed to create notification:", err);
    // Usually silent – don't disturb user experience for notifications
  }
};