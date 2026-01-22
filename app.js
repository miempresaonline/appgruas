const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// Log startup attempt immediately
try {
    const logPath = path.join(__dirname, 'public', 'smoke.txt');
    fs.writeFileSync(logPath, `Server attempting start at ${new Date().toISOString()} on port ${port}\n`);
} catch (e) {
    console.error("Could not write smoke log", e);
}

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('HOLA! Node.js funciona desde app.js. Puerto: ' + port);
});

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
    try {
        const logPath = path.join(__dirname, 'public', 'smoke.txt');
        fs.appendFileSync(logPath, `Server LISTENING on port ${port}\n`);
    } catch (e) { }
});
