import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const setUserRole = functions
  .runWith({ minInstances: 0 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Must be authenticated to call this function',
      );
    }

    const callerDoc = await db.doc(`users/${context.auth.uid}`).get();
    const callerRole = callerDoc.data()?.role;

    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can set user roles',
      );
    }

    const { uid, role } = data;

    if (!uid || !role) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'uid and role are required',
      );
    }

    if (!['admin', 'user'].includes(role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Role must be "admin" or "user"',
      );
    }

    await admin.auth().setCustomUserClaims(uid, { role });
    await db.doc(`users/${uid}`).update({ role });

    return { success: true, uid, role };
  });
