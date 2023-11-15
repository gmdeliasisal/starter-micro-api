const http = require('http');
const url = require('url');
const crypto = require('crypto');
const encoder = new TextEncoder();

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {      
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
            console.log(`Received a POST request with invalid GitHub signature`);
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

// Funzione per verificare la firma GitHub
function verifyGitHubSignature(secret, req) {
    const signature = req.headers['x-hub-signature-256'];

    if (!signature) {
        return false;
    }

    const sha256 = crypto.createHmac('sha256', secret);
    const digest = sha256.update(req.rawBody || '').digest('hex');
    const expectedSignature = `sha256=${digest}`;

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

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
server.use(rawBodyMiddleware);
