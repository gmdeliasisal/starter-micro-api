const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        // Ottieni il nome del dominio del mittente dalla richiesta
        const originDomain = req.headers['origin'] || req.headers['referer'];

        // Verifica se il dominio del mittente è quello desiderato (es. github.com)
        if (isRequestFromGitHub(originDomain)) {
            console.log(`Got a POST request from GitHub at ${req.url}!`);

            let data = '';

            // Ascolta l'evento 'data' per ottenere il corpo della richiesta
            req.on('data', (chunk) => {
                data += chunk;
            });

            // Ascolta l'evento 'end' per elaborare il corpo quando è completamente ricevuto
            req.on('end', () => {
                const requestBody = JSON.parse(data);
                console.log('Request Body:', requestBody);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('OK');
            });
        } else {
            console.log(`Received a POST request from unauthorized domain ${originDomain}`);
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

// Funzione per verificare se il dominio è quello desiderato (es. github.com)
function isRequestFromGitHub(originDomain) {
    // Aggiungi altri controlli se necessario
    return originDomain && (originDomain.includes('github.com') || originDomain.includes('githubusercontent.com'));
}
