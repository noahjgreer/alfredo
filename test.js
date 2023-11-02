const express = require('express');
const http = require('http');
const https = require('https');
const cors = require('cors');
//const bodyParser = require('body-parser');

const app = express();
const fs = require('fs');
const fsp = require('fs/promises');
const { json } = require('body-parser');
const e = require('express');
const port = 3000;
const httpsPort = 3001;

const databaseDir = "F:/web-private/alfredo/users.json"

fsp.readFile('F:/web-private/alfredo/lists/bob.json', 'utf8').then((data) => {
    console.log(data);
}).catch((err) => {
    fsp.writeFile('F:/web-private/alfredo/lists/bob.json', JSON.stringify({ "name": "bob" }), {
        encoding: 'utf8',
        flag: 'w'
    }).then(() => {
        console.log("file created");
    }).catch((err) => {
        console.log(err);
    });
});