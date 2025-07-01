const https = require('https');

console.log('Testing connection to MealMatch backend...');

const options = {
  hostname: 'mealmatch-backend.onrender.com',
  port: 443,
  path: '/api/health',
  method: 'GET'
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response body:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('✅ Backend is accessible!');
      console.log('✅ Database status:', parsed.database);
      console.log('✅ Features available:', Object.keys(parsed.features).filter(k => parsed.features[k]));
    } catch (e) {
      console.log('❌ Failed to parse response');
    }
  });
});

req.on('error', (e) => {
  console.error('❌ Connection failed:', e.message);
});

req.setTimeout(10000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

req.end();
