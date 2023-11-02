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
        switch (req.body.purpose) {
            case "login":
                const check = await credentialHandler(req.body.name, req.body.pass).then(data => {
                    if (data == undefined) {
                        res.status(401);
                        res.json({
                            token: "Invalid Token!",
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
                break;
            case "verifyCache":
                const verifyCache = await checkTokenCache(req.body.token).then(data => {
                    res.status(200);
                    res.json({
                        response: data,
                    });
                    res.end();
                });
                break;
            case "fetchTasks":
                const fetchTaskFunction = await fetchTasks(req.body.token, req.body.list).then(data => {
                    res.status(200);
                    console.log(data);
                    res.json({
                        response: data,
                    });
                    res.end();
                }).catch(err => {
                    if (err.message == "Invalid token!") {
                        res.status(401);
                        res.json({
                            response: err.message,
                        });
                        res.end();
                        console.error(err);
                    } else {
                        res.status(401);
                        res.json({
                            response: err.message,
                        });
                        res.end();
                    }
                    
                });
            case "markTaskComplete":
                const markTaskCompleteFunction = await markTaskComplete(req.body.token, req.body.taskID).then(data => {
                    res.status(200);
                    console.log(data);
                    res.json({
                        response: data,
                    });
                    res.end();
                }).catch(err => {
                    res.status(401);
                    res.json({
                        response: err.message,
                    });
                    res.end();
                    console.error(err);
                });
            default:
                res.status(400);
                res.end();
                break;
        }    
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

async function startupScript() {
    // Clear all previously generated tokens
    var database = await fsp.readFile(databaseDir, 'utf8');
    var users = await JSON.parse(database); // Parse the database
    for (var i = 0; i < users.length; i++) {
        if (users[i].token != undefined) {
            delete users[i].token;
        } else {
            break
        }
    }
    users = JSON.stringify(users, null, 4);
    fs.writeFile(databaseDir, users, (err) => {
        if (err) console.error(err);
    });
}

function compareArrays(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

async function markTaskComplete(token, taskID) {
    var tokenNew = token;
    var taskIDNew = taskID;
    // Check for the token validity
    const checkToken = await checkTokenCache(tokenNew);

    // Grab the task file
    if (checkToken) {
        const uuid = await getUUID(tokenNew);
        const taskDir = "F:/web-private/alfredo/lists/" + uuid + "/tasks.json";

        // Update tasklist
        return fsp.readFile(taskDir, 'utf8').then((taskFile) => {
            var taskFileJSON = JSON.parse(taskFile);
            var allTasks = taskFileJSON.all.lists;
            var completedList = [...(taskFileJSON.completed.tasks || [])];

            // Mark task as complete and move it to the completed list
            allTasks.forEach(list => {
                list.tasks.forEach(task => {
                    if (task.id == taskIDNew) {
                        // Mark task as complete
                        task.completed = true;
                        // Task completed date
                        task.completedDate = Date.now();
                        // Add origin list to task
                        task.origin = list.properties.id;
                        // Move task to completed list
                        completedList.push(task);
                        // Remove task from original list
                        var index = list.tasks.indexOf(task);
                        list.tasks.splice(index, 1);

                        console.log("⚠ Task marked complete!");
                    }
                });
            });

            // If the task is not found, check completed tasks
            if (compareArrays(taskFileJSON.completed.tasks, completedList)) {
                console.log("Task not found in all lists, checking completed list!");
                // Did not find any tasks with that ID, check the completed list, and mark it as incomplete
                completedList.forEach(task => {
                    if (task.id == taskIDNew) {
                        console.log("Task found in completed list! Marking as incomplete!");
                        // Mark task as complete
                        task.completed = false;
                        // Move it back to it's origin list
                        allTasks.forEach(list => {
                            if (list.properties.id == task.origin) {
                                list.tasks.push(task);
                            }
                        });
                        // Remove task from completed list
                        var index = completedList.indexOf(task);
                        completedList.splice(index, 1);
                    }
                });

                // if the task is not found in the completed list, throw an error
                if (completedList == taskFileJSON.completed.tasks) {
                    throw new Error("Task not found! " + taskID);
                }
            }
        
            // Update the taskFileJSON
            taskFileJSON.all.lists = allTasks;
            taskFileJSON.completed.tasks = completedList;

            // Write the changes to the file
            taskFileJSON = JSON.stringify(taskFileJSON, null, 4);
            fs.writeFile(taskDir, taskFileJSON, (err) => {
                if (err) console.error(err);
            });
            return "Task marked complete!";
        }).catch(err => {
            console.log(err.errno);
            if (err.errno == -4058) {
                console.log("No tasklist found, creating one!");
                if (fs.existsSync("F:/web-private/alfredo/lists/" + uuid) == false) {
                    console.log("No user directory found, creating one!");
                    fs.mkdir("F:/web-private/alfredo/lists/" + uuid, (err) => {
                        if (err) console.error(err);
                    });
                }
                var tasklistNew = {
                    "all": {
                        "properties": {
                            "name": "All Tasks",
                            "icon": "noodle",
                            "color": "#000000",
                            "tasks": {}
                        },
                        "lists": {}
                    }
                }
                tasklistNew = JSON.stringify(tasklistNew, null, 4);
                fs.writeFile(taskDir, tasklistNew, (err) => {
                    if (err) console.error(err);
                });
                return markTaskComplete(token, taskID);
            } else {
                console.log(err);
            }
        })
    } else {
        throw new Error("Invalid token!");
    }
}
    

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
                users[i].token = identifierGen("token");
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

async function checkTokenCache(token) {
    var database = await fsp.readFile(databaseDir, 'utf8');
    var users = await JSON.parse(database); // Parse the database

    for (var i = 0; i < users.length; i++) {
        if (token == users[i].token) {
            console.log("Valid token! " + token);
            return true;
            break;
        }
        if (i == users.length - 1) {
            console.log("No token found!");
            return false;
            break;
        }
    }
}

async function getUUID(token) {
    var database = await fsp.readFile(databaseDir, 'utf8');
    var users = await JSON.parse(database); // Parse the database

    for (var i = 0; i < users.length; i++) {
        if (token == users[i].token) {
            console.log("Valid uuid! " + users[i].uuid);
            return users[i].uuid;
        }
        if (i == users.length - 1) {
            return false;
        }
    }
}

async function fetchTasks(token, tasklist) {
    console.log("fetchTasks called");
    const checkToken = await checkTokenCache(token);
    if (checkToken) {
        const uuid = await getUUID(token);
        const taskDir = "F:/web-private/alfredo/lists/" + uuid + "/tasks.json";
        // Check if user has a tasklist, if not, create one
        return fsp.readFile(taskDir, 'utf8').then((taskFile) => {
            var taskFileJSON = JSON.parse(taskFile);
            console.log(tasklist);
            if (tasklist == undefined) {
                console.log("No tasklist specified, fetching all lists!");
                var tasklists = [];
                tasklists.push(taskFileJSON.all.properties);
                taskFileJSON.all.lists.forEach(list => {
                    tasklists.push(list.properties);
                });
                // Finally, push the completed tasks list
                tasklists.push(taskFileJSON.completed.properties);
                // console.log(tasklists);
                console.log("returning tasklists");
                return tasklists;
            } else {
                // check if the tasklist is the completed list
                if (tasklist == taskFileJSON.completed.properties.id) {
                    return taskFileJSON.completed;
                }

                // Tasklist is defined, grab that list and send it to the user.
                var getTasklist = function(tasklist) {
                    taskFileJSON.all.lists.forEach(element => {
                    if (element.properties.id == tasklist) {
                        tasklist = element;
                        return tasklist;
                    }
                    });
                    return tasklist;
                }
                return getTasklist(tasklist);
            }
        }).catch(err => {
            console.log(err.errno);
            if (err.errno == -4058) {
                console.log("No tasklist found, creating one!");
                if (fs.existsSync("F:/web-private/alfredo/lists/" + uuid) == false) {
                    console.log("No user directory found, creating one!");
                    fs.mkdir("F:/web-private/alfredo/lists/" + uuid, (err) => {
                        if (err) console.error(err);
                    });
                }
                var tasklistNew = {
                    "all": {
                        "properties": {
                            "name": "All Tasks",
                            "icon": "noodle",
                            "color": "#000000"
                        },
                        "lists": {}
                    }
                }
                tasklistNew = JSON.stringify(tasklistNew, null, 4);
                fs.writeFile(taskDir, tasklistNew, (err) => {
                    if (err) console.error(err);
                });
                return fetchTasks(token, tasklist);
            } else {
                console.log(err);
            }
        })
    } else {
        console.log("Invalid token! at fetchTasks");
        throw new Error("Invalid token!");
    }
}

/**
 * Generates a random identifier string based on the provided parameters.
 *
 * @param {string} type - The type of identifier to generate. This determines the prefix of the identifier, along with its length and characters. 
 *                        Possible values are "token", "uuid", "list", "task", and any other string (which will use the default prefix "any_").
 * @param {number} [length=6] - Only required if type is not provided! The length of the identifier to generate, not including the prefix.
 * @param {boolean} [numOnly=false] - Only required if type is not provided! Whether to generate an identifier using only numbers.
 * @returns {string} The generated identifier, consisting of a prefix based on the type parameter and a random string of the specified length.
 */
function identifierGen(type, length, numOnly) {
    var prefix;

    switch (type) {
        case "token":
            prefix = "tkn_";
            length = 64;
            numOnly = false;
            break;
        case "uuid":
            prefix = "uuid_";
            length = 32;
            numOnly = false;
            break;
        case "list":
            prefix = "lst_";
            length = 6;
            numOnly = true;
            break;
        case "task":
            prefix = "tsk_";
            length = 6;
            numOnly = true;
            break;
        default:
            prefix = "any_";
            length = length || 6;
            numOnly = numOnly || false;
            break;
    }

    switch (numOnly) {
        case true:
            var characters = '0123456789';
            break;
        case false:
            var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            break;
        default:
            var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
            break;
    }

    var results = '';
    var charsLength = characters.length;
    var check = 2;

    for (i=0; i<=length; i++) {
        var mix = characters.charAt(Math.floor(Math.random() * charsLength));     
        if (mix.match(/[a-z]/i) && check>0) {
            mix =  mix.toUpperCase();
            check --;
        }
        var newString = results += mix;
        newString = prefix + newString;
    }
    console.log(newString);
    return newString;
    
}

//credentialHandler("Alfredo", "password");


// Server Starting
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync("Z:/Web/MuffinMode/certificates/alfredo/privkey1.pem"),
    cert: fs.readFileSync("Z:/Web/MuffinMode/certificates/alfredo/fullchain1.pem"),
    // key: fs.readFileSync("F:/web-private/cert/CA/localhost/localhost.decrypted.key"),
    // cert: fs.readFileSync("F:/web-private/cert/CA/localhost/localhost.crt"),
}, app);

httpServer.listen(port, () => {
    console.log('HTTP server running on port ' + port);
});

httpsServer.listen(httpsPort, () => {
    console.log('HTTPS server running on port ' + httpsPort);
    
    //startupScript();
});