const { getAdminDb } = require('../lib/firebaseAdmin');
require('dotenv').config({ path: '.env.local' });

async function checkOrder() {
    const adminDb = await getAdminDb();
    const orderId = 'IN0526-4117';
    console.log(`Checking order: ${orderId}`);
    
    const doc = await adminDb.collection('orders').doc(orderId).get();
    if (!doc.exists) {
        console.log("Order not found in Firestore.");
    } else {
        const data = doc.data();
        console.log("Order Data:", JSON.stringify(data, null, 2));
    }
    process.exit(0);
}

checkOrder().catch(console.error);
