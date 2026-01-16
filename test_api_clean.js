const http = require('http');

http.get('http://localhost:3001/api/automations', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log("Not JSON:", data);
        }
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
