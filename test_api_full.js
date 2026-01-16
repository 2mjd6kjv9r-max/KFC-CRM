const fetch = require('node-fetch'); // Need to ensure node-fetch is available or use built-in global fetch if node 18+

if (!globalThis.fetch) {
    globalThis.fetch = require('node-fetch');
}

fetch('http://localhost:3001/api/automations')
    .then(res => res.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(err => console.error(err));
