const http = require('http');
const url = require('url');
const crypto = require('crypto');
const encoder = new TextEncoder();


async function verifySignature(secret, header, payload) {
    let parts = header.split("=");
    let sigHex = parts[1];

    let algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };

    let keyBytes = encoder.encode(secret);
    let extractable = false;
    let key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        algorithm,
        extractable,
        [ "sign", "verify" ],
    );

    let sigBytes = hexToBytes(sigHex);
    let dataBytes = encoder.encode(payload);
    let equal = await crypto.subtle.verify(
        algorithm.name,
        key,
        sigBytes,
        dataBytes,
    );

    return equal;
}

function hexToBytes(hex) {
    let len = hex.length / 2;
    let bytes = new Uint8Array(len);

    let index = 0;
    for (let i = 0; i < hex.length; i += 2) {
        let c = hex.slice(i, i + 2);
        let b = parseInt(c, 16);
        bytes[index] = b;
        index += 1;
    }

    return bytes;
}


const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        const originDomain = req.headers['origin'] || req.headers['referer'];
        const githubSecret = 'mariorossi12345';

        // Verifica la provenienza della richiesta utilizzando la firma
       const signatureHeader = req.headers['x-hub-signature-256'];
        if (verifySignature(githubSecret, signatureHeader, req.rawBody)) {
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

