const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

function logError(error) {
    const logPath = path.join(__dirname, 'public', 'app-error_log.txt');
    const msg = `[${new Date().toISOString()}] ERROR: ${error.stack || error}\n`;
    fs.appendFileSync(logPath, msg);
    console.error(error);
}

try {
    const app = next({ dev, hostname, port });
    const handle = app.getRequestHandler();

    app.prepare().then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true);
                if (parsedUrl.pathname === '/a') {
                    await app.render(req, res, '/a', parsedUrl.query);
                } else if (parsedUrl.pathname === '/b') {
                    await app.render(req, res, '/b', parsedUrl.query);
                } else {
                    await handle(req, res, parsedUrl);
                }
            } catch (err) {
                logError(err);
                res.statusCode = 500;
                res.end('internal server error');
            }
        })
            .once('error', (err) => {
                logError(err);
                process.exit(1);
            })
            .listen(port, () => {
                console.log(`> Ready on http://${hostname}:${port}`);
            });
    }).catch(err => {
        logError("Failed to prepare Next.js app: " + err);
    });
} catch (err) {
    logError("Fatal startup error: " + err);
}
