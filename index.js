const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

// Log startup attempt immediately
const logPath = path.join(__dirname, 'public', 'smoke_index.txt');

try {
    fs.writeFileSync(logPath, `[${new Date().toISOString()}] STARTING... PORT=${port}\n`);
} catch (e) {
    console.error("Could not write smoke log", e);
}

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('HOLA! Node.js funciona desde index.js (Smoke Test). Puerto: ' + port);
});

server.on('error', (e) => {
    try {
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] SERVER ERROR: ${e.message} / ${e.code}\n`);
    } catch (logErr) {
        console.error(logErr);
    }
});

try {
    server.listen(port, () => {
        console.log(`Server running at port ${port}`);
        try {
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] SUCCESS: Listening on port ${port}\n`);
        } catch (e) { }
    });
} catch (e) {
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] LISTEN EXCEPTION: ${e.message}\n`);
}
