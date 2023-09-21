const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');
//const bodyParser = require('body-parser');

const app = express();
const fs = require('fs');
const port = 3000;
const httpsPort = 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
//app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    console.log("request recieved" + new Date().toISOString());
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, token');
    res.write('Christ is my firm foundation.');
    res.end();
    if (req.method.toLowerCase() == 'options') {
        res.writeHead(200);
    }
})

app.post('/', (req, res) => {
    console.log(req.body);
    // res.write(JSON.stringify({
    //response: "I recieved the request. Just letting you know. I don't know how to pass through a message simply without encoding it into JSON, so I hope you don't mind. I mean, I am sure I could probably figure it out if I gave it the time but I am tired and should probably head to bed now uwu."
//}));
    res.writeHead(418);
    res.end();
})

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync("Z:/Web/MuffinMode/certificates/alfredo/privkey1.pem"),
    cert: fs.readFileSync("Z:/Web/MuffinMode/certificates/alfredo/fullchain1.pem"),
}, app);

httpServer.listen(port, () => {
    console.log('HTTP server running on port ' + port);
})

httpsServer.listen(httpsPort, () => {
    console.log('HTTPS server running on port ' + httpsPort);
})

/*const express = require('express')
const app = express()
const port = 3000


app.get('/', (req, res) => {
    // Accepting the Request
    console.log('ACCEPTED request to: ' + req.url + ', at: ' + new Date().toISOString());
    res.sendStatus(202);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    // Checking credentials
    if (req.headers['credentials'] == "alfredo") {
        console.log('CREDENTIALS MATCHED.');
        res.send(JSON.stringify(req.headers['x-api-key']));
        res.end(() => {
            console.log('ENDED response to: ' + req.url + ', at: ' + new Date().toISOString());
        });
        setTimeout(() => {
            res.connection.destroy('504')
        }, 5000)
    } else {
        console.log('API KEY MISMATCH: ' + req.headers['credentials'] + " with headers: " + JSON.stringify(req.headers));
        console.log('ENDED response to: ' + req.url + ', at: ' + new Date().toISOString());
        res.connection.destroy('401');
    }
    console.log('Request Recieved.');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

function closeSockets() {
    app.connection.destroy();
}*/