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

const databaseDir = 'Z:/Web/Private/alfredo/users.json'

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

app.post('/', async (req, res) => {
    try {
        const check = await credentialHandler(req.body.name, req.body.pass).then(data => {
            if (data == undefined) {
                res.status(401);
                res.json({
                    token: "Invalid",
                });
                res.end();
            } else {
                console.log(data);
                res.status(200);
                res.json({
                    token: data,
                });
                res.end();

            }
        });
        
    } catch (err) {
        console.log(err);
    }
    /*
    var response;
    var check = await credentialHandler(req.body.name, req.body.pass);

    res.json(JSON.stringify({
        token: check,
    }));
    res.end();
    //console.log(req.body.name);
    //console.log(response);

    //res.writeHead(200);
    
    res.write(JSON.stringify({
        response: "faat",
    }));
    await res.write(JSON.stringify({
        token: check,
    })).then(cb => {
        res.end();

    }
    );*/
    
})

async function credentialHandler(username, password) {
    var database = await fsp.readFile(databaseDir, 'utf8');
    var users = await JSON.parse(database); // Read the data
    var user;
    var userIndex;
    var userToken;
    
    // Search for the user in the database
    for (var i = 0; i < users.length; i++) {
        if (username == users[i].name && password == users[i].password) {
            console.log("Valid user!" + users[i].name);
            console.log(users);
            if (users[i].token == undefined) {
                users[i].token = tokenGen();
                userToken = users[i].token;

                users = JSON.stringify(users, null, 4);

                fs.writeFile(databaseDir, users, (err) => {

                });

                return userToken;
                break;
            } else {
                userToken = users[i].token;
                return userToken;
                break;
            }
            
        }
        if (i == users.length - 1) {
            console.log("Invalid user!");
            return undefined;
            break;
        }
    }
}

function tokenGen() {
    var characters = 'abcdefghijklmnoqrstuvwxyz0123456789';
    var results = '';
    var length = characters.length;

    var check = 2;
    for (i=0; i<=26; i++) {
        var mix = characters.charAt(Math.floor(Math.random() * length));     
        if (mix.match(/[a-z]/i) && check>0) {
            mix =  mix.toUpperCase();
            check --;
        }
    var newString = results += mix;
    }
    return newString;
}

//credentialHandler("Alfredo", "password");


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