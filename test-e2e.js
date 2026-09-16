const baseUrl = 'http://localhost:4000';
const email = 'avenik-runtime-test-' + Date.now() + '@example.com';
const password = 'TestPassword123!';

async function run() {
  console.log('1. Registering user...');
  const regRes = await fetch(baseUrl + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password, roleCode: 'ENTREPRENEUR' })
  });
  const regData = await regRes.json();
  const token = regData.data.token;

  console.log('\n2. Fetching Context (No Business)...');
  const ctxRes = await fetch(baseUrl + '/api/context/current', { headers: { 'Authorization': 'Bearer ' + token } });
  const ctxData = await ctxRes.json();
  console.log('Business:', ctxData.data.business);

  console.log('\n3. Creating Business...');
  const busRes = await fetch(baseUrl + '/api/business', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ displayName: 'Test Business', legalName: 'Test Business Pvt Ltd', countryCode: 'IN' })
  });
  const busData = await busRes.json();
  console.log('Created Business:', busData.data.id);

  console.log('\n4. Fetching Context (With Business)...');
  const ctxRes2 = await fetch(baseUrl + '/api/context/current', { headers: { 'Authorization': 'Bearer ' + token } });
  const ctxData2 = await ctxRes2.json();
  console.log('Business:', ctxData2.data.business);
}
run().catch(console.error);
