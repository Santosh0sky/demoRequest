const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        // Read existing messages from file
        let messages = [];
        const filePath = path.join(__dirname, 'messages.txt');

        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            // Split by new line, filter empty lines, reverse for latest on top
            messages = fileData
                .split('\n')
                .filter(line => line.trim() !== '')
                .reverse();
        }

        // Create HTML list of messages
        const messagesHtml = messages
            .map(msg => `<p>${msg}</p>`)
            .join('');

        // Serve the form + messages
        res.setHeader('Content-Type', 'text/html');
        res.end(`
            <html>
                <head>
                    <title>Message Board</title>
                    <style>
                        body { font-family: Arial; max-width: 600px; margin: 20px auto; }
                        form { margin-top: 20px; }
                        p { background: #f0f0f0; padding: 10px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h1>Message Board</h1>
                    ${messagesHtml}
                    <form action="/message" method="POST">
                        <input type="text" name="message" placeholder="Your message" required>
                        <button type="submit">Send</button>
                    </form>
                </body>
            </html>
        `);
    } else if (req.url === '/message' && req.method === 'POST') {
        const bodyChunks = [];

        req.on('data', chunk => {
            bodyChunks.push(chunk);
        });

        req.on('end', () => {
            const body = Buffer.concat(bodyChunks).toString();
            const message = decodeURIComponent(body.split('=')[1]);

            // Append the new message to file
            fs.appendFileSync('messages.txt', message + '\n');

            // Redirect back to home page
            res.statusCode = 302;
            res.setHeader('Location', '/');
            res.end();
        });
    } else {
        // Handle unknown routes
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Page Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});