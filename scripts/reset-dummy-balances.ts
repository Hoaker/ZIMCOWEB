import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);

async function resetAllDummyBalances() {
  console.log('Connecting to database:', firebaseConfig.projectId);
  const usersSnap = await getDocs(collection(db, 'users'));
  console.log(`Found ${usersSnap.size} member accounts in Firestore.`);

  let resetCount = 0;
  const docs = usersSnap.docs;
  const CHUNK_SIZE = 100;

  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const chunk = docs.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const uDoc of chunk) {
      const data = uDoc.data();
      const hasMonthlyRecords = Array.isArray(data.monthlySavingsRecords) && data.monthlySavingsRecords.length > 0;
      
      let os = 0;
      let ss = 0;
      let ia = 0;
      let cp = 0;
      let mc = 0;
      let lr = 0;

      // If user has legitimate approved monthly records, sum them accurately
      if (hasMonthlyRecords) {
        data.monthlySavingsRecords.forEach((r: any) => {
          os += Number(r.ordinarySavings || 0);
          ss += Number(r.specialSavings || 0);
          ia += Number(r.investment || r.investmentAmount || 0);
          cp += Number(r.commodityPurchase || r.commoditySavings || 0);
          mc += Number(r.muslimCommunity || r.muslimCommunitySavings || r.muslimSavings || 0);
          lr += Number(r.loanReimbursement || 0);
        });
      }

      batch.update(doc(db, 'users', uDoc.id), {
        ordinarySavings: os,
        specialSavings: ss,
        investmentAmount: ia,
        commoditySavings: cp,
        muslimCommunitySavings: mc,
        muslimSavings: mc,
        outstandingLoans: lr > 0 ? Number(data.outstandingLoans || 0) : 0,
        totalSavings: os + ss + ia + cp + mc,
        lastDeductionAmount: hasMonthlyRecords ? Number(data.lastDeductionAmount || 0) : 0,
        lastDeductionBreakdown: hasMonthlyRecords ? data.lastDeductionBreakdown : null,
      });

      resetCount++;
    }

    await batch.commit();
    console.log(`Batch processed: ${Math.min(i + CHUNK_SIZE, docs.length)} / ${docs.length} users updated.`);
  }

  console.log('\n========================================');
  console.log(`✅ Successfully reset balances across ${resetCount} member profiles to clean state (₦0.00 base).`);
  console.log('========================================');
}

resetAllDummyBalances()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error resetting balances:', err);
    process.exit(1);
  });
