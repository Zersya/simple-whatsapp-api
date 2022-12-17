
require('dotenv').config()

const express = require('express')
const qrcode = require('qrcode-terminal');


const app = express()
const port = 3001

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-two" }),
    puppeteer: {
        args: ['--no-sandbox'],
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    if (message.body === '!ping') {
        client.sendMessage(message.from, 'pong');
    }
});


client.initialize().then(() => {
    app.post('/api/send', (req, res) => {
        const { message, number } = req.query;
        const reqWhatsappApiKey = req.headers['x-whatsapp-api-key'];

        const envWhatsappApiKey = process.env.WHATSAPP_API_KEY;

        if (reqWhatsappApiKey !== envWhatsappApiKey) {
            res.status(401).send('Unauthorized');
            return;
        }

        client.sendMessage(`${number}@c.us`, message);

        res.send('Message sent!')
    })

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })

});

