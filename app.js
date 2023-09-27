const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');
//const bodyParser = require('body-parser');

const app = express();
const fs = require('fs');
const fsp = require('fs/promises');
const { json } = require('body-parser');
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
    var response;
    checkDatabaseForCreds(req.body.username, req.body.password).then((feedback) => {
        console.log(feedback);
        // Search Feedback for username and password
        for (var i = 0; i < feedback.users.length; i++) {
            console.log(req.body.name + feedback.users[i].name + req.body.pass + feedback.users[i].password);
            if (req.body.name == feedback.users[i].name && req.body.pass == feedback.users[i].password) {
                console.log("Valid user!" + feedback.users[i].name);

                assignToken(i);
                break;
            } else {
                console.log("You are not logged in.");
            }
        }
    });
    console.log(req.body.name);
    console.log(response);
    res.writeHead(200);
    res.write(JSON.stringify({
    response: "I recieved the request. Just letting you know. I don't know how to pass through a message simply without encoding it into JSON, so I hope you don't mind. I mean, I am sure I could probably figure it out if I gave it the time but I am tired and should probably head to bed now uwu."
}));
    res.end();
})

async function checkDatabaseForCreds(username, password) {
    try {
        const data = await fsp.readFile('Z:/Web/Private/alfredo/users.json', 'utf8');
        const database = JSON.parse(data);
        return database;
    } catch (err) {
        console.error(err + " Uh oh, stinky!");
    }
}

async function assignToken(userLocation) {
}



// Server Starting
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