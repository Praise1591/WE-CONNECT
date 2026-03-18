// functions/index.js

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const admin = require("firebase-admin");

admin.initializeApp();

exports.acceptConnectionRequest = onCall(
  { region: "us-central1" },   // ← change to your preferred region if needed (e.g. "europe-west1")
  async (request) => {
    const { senderId } = request.data;

    logger.info("acceptConnectionRequest called", {
      callerUid: request.auth?.uid,
      senderId,
    });

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    if (!senderId) {
      throw new HttpsError("invalid-argument", "senderId is required.");
    }

    const currentUid = request.auth.uid;

    if (senderId === currentUid) {
      throw new HttpsError("invalid-argument", "Cannot connect to yourself.");
    }

    const db = admin.firestore();

    try {
      // 1. Add bidirectional connection
      await db.runTransaction(async (t) => {
        const currentUserRef = db.collection("users").doc(currentUid);
        const senderRef = db.collection("users").doc(senderId);

        t.update(currentUserRef, {
          connections: admin.firestore.FieldValue.arrayUnion(senderId),
        });

        t.update(senderRef, {
          connections: admin.firestore.FieldValue.arrayUnion(currentUid),
        });
      });

      // 2. (Optional) Clean up request docs — but your client already does this, so maybe not needed here

      logger.info(`Connection created: ${currentUid} ↔ ${senderId}`);

      return { success: true, message: "Connected successfully" };
    } catch (error) {
      logger.error("Connection transaction failed", error);
      throw new HttpsError("internal", "Failed to create connection", {
        originalMessage: error.message,
      });
    }
  }
);