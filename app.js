const fs = require('fs');
const path = require('path');
const http = require('http');

// Path to write the dump
const logPath = path.join(__dirname, 'public', 'env_dump.txt');

try {
    // Dump all environment variables
    const envData = JSON.stringify(process.env, null, 2);
    const content = `TIMESTAMP: ${new Date().toISOString()}\n\nPROCESS.ENV:\n${envData}`;

    // Write synchronously to ensure it exists before crash
    fs.writeFileSync(logPath, content);
    console.log("Environment dumped to " + logPath);
} catch (e) {
    console.error("Failed to dump env", e);
}

// Minimal keep-alive attempt
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.end('Env Dumped. Check /env_dump.txt');
});

// Try to listen, but expects crash if 3000 is blocked
server.listen(port, () => {
    console.log(`Listening on ${port}`);
});
