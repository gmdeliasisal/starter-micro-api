const http = require('http');
const url = require('url');
const crypto = require('crypto');
const encoder = new TextEncoder();

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        const originDomain = req.headers['origin'] || req.headers['referer'];
        const githubSecret = 'mariorossi12345';

        // Verifica la provenienza della richiesta utilizzando la firma
        if (verifyGitHubSignature(githubSecret, req)) {
            console.log(`Got a POST request from GitHub at ${req.url}!`);

            let data = '';

            req.on('data', (chunk) => {
                data += chunk;
            });

            req.on('end', () => {
                const requestBody = JSON.parse(data);
                console.log('Request Body:', requestBody);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
            });
        } else {
            console.log(`Received a POST request with invalid GitHub signature from ${originDomain}`);
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Forbidden');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Middleware per ottenere il corpo della richiesta come stringa
function rawBodyMiddleware(req, res, next) {
    let data = '';

    req.on('data', (chunk) => {
        data += chunk;
    });

    req.on('end', () => {
        req.rawBody = data;
        next();
    });
}

// Usa il middleware per ottenere il corpo della richiesta come stringa
server.on('request', (req, res) => {
    rawBodyMiddleware(req, res, () => {});
});
