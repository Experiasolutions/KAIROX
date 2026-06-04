const https = require('https');
const ids = ['6e288ae4-b99f-4bf3-b61a-462c5a858901', 'b1b1cf54-c1b0-49f5-83e5-75abfca0db42', 'a1f1f21c-7012-4a6b-8cb5-5e7d084be49b'];

ids.forEach(token => {
  ids.forEach(projectId => {
    if (token === projectId) return;
    const gql = `{ project(id: "${projectId}") { name } }`;
    const body = JSON.stringify({ query: gql });
    
    const req = https.request({
      hostname: 'backboard.railway.com', path: '/graphql/v2', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = ''; res.on('data', c => data += c);
      res.on('end', () => {
        if (!data.includes('Not Authorized') && !data.includes('Project not found')) {
            console.log('\n=======================================');
            console.log('✅ SUCESSO ENCONTRADO!');
            console.log('TOKEN:', token);
            console.log('PROJECT ID:', projectId);
            console.log('RESPOSTA:', data);
            console.log('=======================================\n');
        }
      });
    });
    req.write(body); req.end();
  });
});
