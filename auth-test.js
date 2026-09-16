const baseUrl = 'http://localhost:4000';

async function createUserAndBusiness(name, email, password) {
  // Register
  let res = await fetch(baseUrl + '/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, roleCode: 'ENTREPRENEUR' })
  });
  let data = await res.json();
  const token = data.data.token;

  // Create Business
  res = await fetch(baseUrl + '/api/business', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ displayName: name + ' Business', legalName: name + ' LLC', countryCode: 'IN' })
  });
  data = await res.json();
  const businessId = data.data.id;

  return { token, businessId };
}

async function fetchContext(token, requestedBusinessId) {
  const res = await fetch(baseUrl + '/api/context/current?businessId=' + requestedBusinessId, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  return res.status; // expecting 200 or 403
}

async function run() {
  const timestamp = Date.now();
  console.log('Creating User A...');
  const a = await createUserAndBusiness('User A', 'usera-' + timestamp + '@example.com', 'Pass123!');
  
  console.log('Creating User B...');
  const b = await createUserAndBusiness('User B', 'userb-' + timestamp + '@example.com', 'Pass123!');

  console.log('\nTesting A -> A (Expected: 200)');
  let s1 = await fetchContext(a.token, a.businessId);
  console.log('Result:', s1);

  console.log('\nTesting B -> B (Expected: 200)');
  let s2 = await fetchContext(b.token, b.businessId);
  console.log('Result:', s2);

  console.log('\nTesting A -> B (Expected: 403 or 401)');
  let s3 = await fetchContext(a.token, b.businessId);
  console.log('Result:', s3);

  console.log('\nTesting B -> A (Expected: 403 or 401)');
  let s4 = await fetchContext(b.token, a.businessId);
  console.log('Result:', s4);

  console.log('\nTesting Unauth -> A (Expected: 401)');
  let res = await fetch(baseUrl + '/api/context/current?businessId=' + a.businessId);
  console.log('Result:', res.status);
}
run().catch(console.error);
