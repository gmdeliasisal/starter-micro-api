const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware per analizzare il corpo della richiesta POST
app.use(bodyParser.json());

app.post('/', (req, res) => {
    // Ottieni il nome del dominio del mittente dalla richiesta
    const originDomain = req.get('origin') || req.get('referer');

    // Verifica se il dominio del mittente è quello desiderato (es. github.com)
    if (isRequestFromGitHub(originDomain)) {
        console.log(`Got a POST request from GitHub at ${req.url}!`);
        console.log('Request Body:', req.body);

        res.status(200).send('OK');
    } else {
        console.log(`Received a POST request from unauthorized domain ${originDomain}`);
        res.status(403).send('Forbidden');
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Funzione per verificare se il dominio è quello desiderato (es. github.com)
function isRequestFromGitHub(originDomain) {
    // Aggiungi altri controlli se necessario
    return originDomain && (originDomain.includes('github.com') || originDomain.includes('githubusercontent.com'));
}
