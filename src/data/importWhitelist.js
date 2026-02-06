const admin = require('firebase-admin');

// ෆයිල් දෙක import කරගන්නවා
const serviceAccount = require('./serviceAccount.json');
const students = require('./allowed_students.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadWhitelist() {
  console.log("⏳ ලිස්ට් එක Upload වෙනවා... පොඩ්ඩක් ඉන්න.");
  
  const collectionRef = db.collection('whitelist');
  const batchSize = 400; // Firebase එක පාරකට docs 500ක් විතරයි ගන්නේ
  
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = db.batch();
    const chunk = students.slice(i, i + batchSize);
    
    chunk.forEach((regNo) => {
      const docRef = collectionRef.doc(); 
      batch.set(docRef, { 
          regNo: regNo.trim().toUpperCase(),
          addedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ අංක ${i + chunk.length} ක් දක්වා Upload වුණා...`);
  }
  
  console.log("🎉 ඔක්කොම Reg No ටික සාර්ථකව Firestore එකට දැම්මා!");
  process.exit();
}

uploadWhitelist().catch(console.error);