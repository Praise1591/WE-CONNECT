const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

exports.acceptConnectionRequest = onCall(
  { region: "us-central1" }, // ← change this if your project is in another region (check in Firebase console)
  async (request) => {
    console.log("Function invoked", {
      auth: request.auth ? request.auth.uid : "no auth",
      data: request.data,
    });

    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const { senderId } = request.data || {};
    if (!senderId) {
      console.log("Missing senderId");
      throw new HttpsError("invalid-argument", "senderId is required.");
    }

    const currentUid = request.auth.uid;
    console.log(`Attempting to connect ${currentUid} ↔ ${senderId}`);

    if (senderId === currentUid) {
      throw new HttpsError("invalid-argument", "Cannot connect to yourself.");
    }

    const db = admin.firestore();
    const currentRef = db.collection("users").doc(currentUid);
    const senderRef   = db.collection("users").doc(senderId);

    try {
      // Quick existence check (optional but helps debugging)
      const [currentSnap, senderSnap] = await Promise.all([
        currentRef.get(),
        senderRef.get(),
      ]);

      if (!currentSnap.exists) throw new Error(`Current user doc missing: ${currentUid}`);
      if (!senderSnap.exists)   throw new Error(`Sender user doc missing: ${senderId}`);

      await db.runTransaction(async (t) => {
        const cDoc = await t.get(currentRef);
        const sDoc = await t.get(senderRef);

        if (!cDoc.exists) throw new Error("Current user disappeared during transaction");
        if (!sDoc.exists) throw new Error("Sender user disappeared during transaction");

        t.update(currentRef, {
          connections: admin.firestore.FieldValue.arrayUnion(senderId),
        });

        t.update(senderRef, {
          connections: admin.firestore.FieldValue.arrayUnion(currentUid),
        });
      });

      console.log("Transaction committed successfully");
      return { success: true, message: "Connected" };
    } catch (err) {
      console.error("acceptConnectionRequest failed:", {
        message: err.message,
        stack: err.stack,
        code: err.code,
      });
      throw new HttpsError("internal", "Could not create connection", {
        details: err.message,
      });
    }
  }
);