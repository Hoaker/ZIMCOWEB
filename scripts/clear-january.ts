import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);

async function cleanJanuaryRecords() {
  console.log('Starting January records cleanup on project:', firebaseConfig.projectId);
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log(`Retrieved ${usersSnap.size} user documents from Firestore.`);

  let updatedUsersCount = 0;
  let clearedJanuaryPassbooks = 0;
  let deletedTransactionsCount = 0;

  const docs = usersSnap.docs;
  const CHUNK_SIZE = 40;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (uDoc) => {
      const data = uDoc.data();
      let needsUpdate = false;
      const updates: Record<string, any> = {};

      // 1. Clean monthlySavingsRecords array
      if (Array.isArray(data.monthlySavingsRecords) && data.monthlySavingsRecords.length > 0) {
        const origLen = data.monthlySavingsRecords.length;
        const filtered = data.monthlySavingsRecords.filter((rec: any) => {
          const m = String(rec.month || rec.cycle || '').toLowerCase().trim();
          const isJan = m.includes('jan') || m.includes('january') || m.includes('2026-01') || m.startsWith('01/');
          return !isJan;
        });

        if (filtered.length !== origLen) {
          updates.monthlySavingsRecords = filtered;
          needsUpdate = true;
          clearedJanuaryPassbooks++;
        }
      }

      // 2. Clean lastDeductionBreakdown if January
      if (data.lastDeductionBreakdown) {
        const cycleStr = String(data.lastDeductionBreakdown.cycle || '').toLowerCase().trim();
        if (cycleStr.includes('jan') || cycleStr.includes('january') || cycleStr.includes('2026-01')) {
          updates.lastDeductionBreakdown = null;
          updates.lastDeductionAmount = 0;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        try {
          await updateDoc(doc(db, 'users', uDoc.id), updates);
          updatedUsersCount++;
        } catch (uErr) {
          console.warn(`Could not update user ${uDoc.id}:`, uErr);
        }
      }

      // 3. Clean January transactions in user subcollection
      try {
        const txSnap = await getDocs(collection(db, 'users', uDoc.id, 'transactions'));
        if (!txSnap.empty) {
          const txToDelete = txSnap.docs.filter((txDoc) => {
            const txData = txDoc.data();
            const desc = String(txData.description || '').toLowerCase();
            const mth = String(txData.month || txData.cycle || '').toLowerCase();
            const dt = String(txData.date || '').toLowerCase();
            return (
              desc.includes('january') || 
              desc.includes('jan 2026') || 
              mth.includes('january') ||
              mth.includes('jan 2026') ||
              dt.startsWith('jan') ||
              dt.includes('january 2026')
            );
          });

          if (txToDelete.length > 0) {
            const batch = writeBatch(db);
            txToDelete.forEach(tx => batch.delete(doc(db, 'users', uDoc.id, 'transactions', tx.id)));
            await batch.commit();
            deletedTransactionsCount += txToDelete.length;
          }
        }
      } catch (txErr) {
        // Subcollection may be empty
      }
    }));

    process.stdout.write(`Processed ${Math.min(i + CHUNK_SIZE, docs.length)} / ${docs.length} users...\r`);
  }

  console.log('\n========================================');
  console.log('✅ January Records Cleanup Completed Successfully:');
  console.log(`- Member Profiles Cleaned: ${updatedUsersCount}`);
  console.log(`- January Passbook Entries Removed: ${clearedJanuaryPassbooks}`);
  console.log(`- January Ledger Transactions Purged: ${deletedTransactionsCount}`);
  console.log('========================================');
}

cleanJanuaryRecords()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Cleanup failed with error:', err);
    process.exit(1);
  });
