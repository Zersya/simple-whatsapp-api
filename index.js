require('dotenv').config()

const express = require('express')
const qrcode = require('qrcode-terminal');
const fileUpload = require('express-fileupload'); 

const app = express()
const port = 3001

app.use(fileUpload());

const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth({ clientId: "client-two" }),
    puppeteer: {
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
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

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



client.initialize().then(() => {
    app.post('/api/send', async (req, res) => {
        const { message, number } = req.query;
        const reqWhatsappApiKey = req.headers['x-whatsapp-api-key'];

        const envWhatsappApiKey = process.env.WHATSAPP_API_KEY;

        if (reqWhatsappApiKey !== envWhatsappApiKey) {
            res.status(401).send('Unauthorized');
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, getRandomInt(1800, 5100)));

            if (req.files && req.files.file) {
                const media = new MessageMedia(req.files.file.mimetype, req.files.file.data.toString('base64'), req.files.file.name);
                await client.sendMessage(`${number}@c.us`, media);
            }
            
            if (message) {
                await new Promise(resolve => setTimeout(resolve, getRandomInt(1800, 5100)));

                await client.sendMessage(`${number}@c.us`, message);
            } else {
                res.status(400).send('A message is required');
                return;
            }

            res.send('Message sent!')
        } catch (error) {
            console.log(error)
            res.status(500).send('Error sending message')
        }
    })

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
});

