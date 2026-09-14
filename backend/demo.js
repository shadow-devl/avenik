import fetch from 'node-fetch'; // wait, we removed node-fetch
// Built-in fetch works.

async function runDemo() {
  console.log('--- AVENIK PHASE 2 E2E DEMO ---');
  
  // 1. Fetch Context
  console.log('\n[1] Retrieving Entrepreneur Context...');
  const ctxRes = await fetch('http://localhost:4000/api/context/current');
  const ctxData = await ctxRes.json();
  console.log('Context Output:', JSON.stringify(ctxData, null, 2));

  if (!ctxData.data.hasBusiness) {
    console.error('No business found. Cannot continue demo.');
    return;
  }

  const businessId = ctxData.data.businessId;

  // 2. Trigger Government Scheme Matching
  console.log('\n[2] Executing Government Scheme Matching Engine...');
  const matchRes = await fetch('http://localhost:4000/api/schemes/match/match', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId })
  });
  const matchData = await matchRes.json();
  console.log('Matching Output:', JSON.stringify(matchData, null, 2));

  // 3. Fetch Stored Matches
  console.log('\n[3] Retrieving Stored Applications/Matches...');
  const appsRes = await fetch(`http://localhost:4000/api/schemes/match/matches/${businessId}`);
  const appsData = await appsRes.json();
  console.log('Stored Applications:', JSON.stringify(appsData, null, 2));

  console.log('\n--- DEMO COMPLETE ---');
}

runDemo().catch(console.error);
