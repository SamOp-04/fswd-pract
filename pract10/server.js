
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const LOG_FILE_PATH = path.join(__dirname, 'error.log');

app.get('/logs', (req, res) => {
    fs.readFile(LOG_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err.message);
            
            if (err.code === 'ENOENT') {
                return res.status(404).send(`
                    <h2>Log file not found</h2>
                    <p>The requested log file does not exist on the server.</p>
                `);
            }

            return res.status(500).send(`
                <h2>Error reading log file</h2>
                <p>${err.message}</p>
            `);
        }

        res.send(`
            <html>
                <head>
                    <title>Error Logs</title>
                    <style>
                        body { font-family: monospace; background: #f4f4f4; padding: 20px; }
                        pre { background: #222; color: #0f0; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Server Error Logs</h1>
                    <pre>${data}</pre>
                </body>
            </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/logs`);
});
