const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

async function purgeOrders() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n").replace(/^"|"$/g, "");

    if (!projectId || !clientEmail || !privateKey) {
      console.error("Missing Firebase credentials in .env.local");
      process.exit(1);
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    const db = getFirestore();
    const snapshot = await db.collection('orders').get();

    if (snapshot.empty) {
      console.log("No orders found to delete.");
      return;
    }

    console.log(`Found ${snapshot.size} orders. Deleting...`);
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log("SUCCESS: All orders deleted.");
  } catch (error) {
    console.error("FAILED to purge orders:", error);
    process.exit(1);
  }
}

purgeOrders();
