

async function testNBA() {
  console.log("Fetching context...");
  const ctxRes = await fetch('http://localhost:4000/api/context/current');
  const ctxJson = await ctxRes.json();
  const businessId = ctxJson.data.businessId;

  console.log("Triggering NBA generation for:", businessId);
  
  const req = await fetch('http://localhost:4000/api/nba/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessId })
  });

  const json = await req.json();
  console.log("NBA Response:");
  console.log(JSON.stringify(json, null, 2));
}

testNBA().catch(console.error);
