// Generic References
var hammerDocument = Hammer(document);
var debugMode = true;

// Get document height
const documentHeight = function () {
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, 
    html.clientHeight, html.scrollHeight, html.offsetHeight );

    return height;
}

// Get URL Search Params and link them to the search bar's parameters
var URLparams = {};

function updateURLParamsObject() {
    if (!window.location.search == '') {
        window.location.search.replace('?', '').split('&').forEach(element => {
            URLparams[element.split('=')[0]] = element.split('=')[1];
        });  
    }
}

function updateURLParams(method, object) {
    var newURLparams = '?';
    // Check if the inputted object has a ? at the start, and remove it if it does
    if (typeof object == 'string' && object[0] == '?') {
        object = object.slice(1);
    }

    function URLobjectHandler(object) {
        if (typeof object == 'string') {
            // push the new element to the URLparams object
            // Handle Multiple param entries
            for (let i = 0; i < object.split(/&|=/).length; i += 2) {
                const element = object.split(/&|=/);
                URLparams[element[i]] = element[i + 1];
            }
            return;
        }
        if (typeof object == 'object' && typeof object[0] == 'string') {
            // push the new element to the URLparams object
            URLparams[object[0]] = object[1];
            return;
        } else {
            object.forEach(element => {
                // push the new element to the URLparams object
                URLparams[element[0]] = element[1];
            });
            return;
        }
    }
    switch (method) {
        case "add":
            URLobjectHandler(object);
            break;
        case "set":
            URLparams = {};
            URLobjectHandler(object);
            break;
        case "reset":
            URLparams = {};
            break;
        case "remove":
            if (typeof object == 'string') {
                delete URLparams[object];
            } else {
                // At this current time this is only used for the page params, so we can assume that the object is an object and not a string
                Object.keys(URLparams).forEach(element => {
                    if (element.toString().includes("page")) {
                        if (JSON.stringify(JSON.parse(decodeURI(URLparams[element]))) == JSON.stringify(object)) {
                            delete URLparams[element];
                        }
                    }
                });
            }
            break;
        default: 
            console.error('Invalid method of: "' + method + '"');
            break;
    }

    if (Object.keys(URLparams).length) {
        // URLparams.forEach(element => {
        //     newURLparams += `${element[0]}=${element[1]}&`;
        //     console.log(element + URLparams);
        // });

        for (var key in URLparams) {
            if (URLparams.hasOwnProperty(key)) {
                newURLparams += `${key}=${URLparams[key]}&`;
            }
        }

        // Use a for...in loop to iterate through the URLparams object
        // for (const key in URLparams) {
        //     if (Object.hasOwnProperty.call(URLparams, key)) {
        //         const element = URLparams[key];
        //         newURLparams += `${key}=${element}&`;
        //     }
        // } 

        // Remove the last & from the string
        newURLparams = newURLparams.slice(0, -1);
    } else {
        newURLparams = '?';
    }
        
    // Update the URL
    window.history.pushState('', '', newURLparams);
}

function updateSectionParamsCache(section) {
    sectionParamsCache[section] = window.location.search + window.location.hash;
    sessionStorage.setItem('sectionParamsCache', JSON.stringify(sectionParamsCache));
}

// Refresh the URLparams object every second
// setInterval(updateURLParamsObject, 1000);

// Detect if page isn't bigger than the screen, and then disable scrolling
function scrollabilityUpdate() {
    if (debugMode) {
        return;
    } else {
        if (documentHeight() <= window.innerHeight) {
            document.body.style.touchAction = 'none';
        } else {
            document.body.style.touchAction = 'auto';
        }
    }
}
scrollabilityUpdate();

//#region Info Container span Separator
var infoContainer = document.querySelectorAll('.info-container');

infoContainer.forEach((element) => {
    // console.log(element.children[0].outerHTML);
    const initialElementCount = element.children.length;

    for (let i = 1; i < ((initialElementCount * 2) - 3); i += 2) {
        element.children[i].outerHTML += `<div class="info-span"></div>`;


        if (i > element.children.length) {
            console.error('For loop exceeded array length.');

        }
    }

    element.children[0].outerHTML += `<div class="info-span"></div>`
});
//#endregion

//#region Viewable Debug
const enableDebug = false;
const debugConsole = document.getElementById('debug');

// Route console errors to an alert using the callAlert function
window.addEventListener("error", (event) => {
    callAlert('An error occurred', `${event.type}: ${event.message}\n`);
    console.log(event);
});  

window.onerror = function (message, source, lineno, colno, error) {
    // Your custom function to handle errors goes here
    console.error(message);
}

// Handle console logs in the visible debug element
if (enableDebug) {
    function debugUpdate() {
        debugConsole.innerHTML = new String(console.logs, console.errors, console.warns, console.debugs);
    }

    console.defaultLog = console.log.bind(console);
    console.logs = [];
    console.log = function(){
        // default &  console.log()
        console.defaultLog.apply(console, arguments);
        // new & array data
        console.logs.push(Array.from(arguments));
        
        debugUpdate();
    }

    console.defaultError = console.error.bind(console);
    console.errors = [];
    console.error = function(){
        // default &  console.error()
        console.defaultError.apply(console, arguments);
        // new & array data
        console.errors.push(Array.from(arguments));

        debugUpdate();

    }

    console.defaultWarn = console.warn.bind(console);
    console.warns = [];
    console.warn = function(){
        // default &  console.warn()
        console.defaultWarn.apply(console, arguments);
        // new & array data
        console.warns.push(Array.from(arguments));

        debugUpdate();

    }

    console.defaultDebug = console.debug.bind(console);
    console.debugs = [];
    console.debug = function(){
        // default &  console.debug()
        console.defaultDebug.apply(console, arguments);
        // new & array data
        console.debugs.push(Array.from(arguments));

        debugUpdate();

    }
}
//#endregion

//#region Alert

//Simple function made to create nodes
function createElement(nodetype, attributes, innertext) {
    var node = document.createElement(nodetype);
    attributes.forEach(element => {
        node.setAttribute(element[0], element[1]);
    });
    if (innertext) node.innerHTML = innertext;
    return node;
}


// Function to call an alert
function callAlert(messageTitle, messageBody, specialAction) {
    preventScroll(true);
    console.log(specialAction)
    var alertElement = document.createElement('div');
    function getSpecialAction(specialAction) {
        if (specialAction) {
            // if (specialAction.toString()[0] == "(") {
            //     return "(" + specialAction + ")();";
            // }
            return "(" + specialAction + ")();";
        } else {
            return '';
        }
    }
    alertElement.setAttribute('class', 'alertContainer');
    alertElement.setAttribute('id', generateID(6));
    var alertID = alertElement.getAttribute('id');
    alertElement.innerHTML = `
    <div id='alert'> 
        <div id="alertMessage">
        <h4 id="messageTitle">
        ${messageTitle}
        </h4>
        <p id="messageBody">
        ${messageBody}
        </p>
        </div>
        <div id="alertOptions">
            <button class="alertButton" id="OK" onclick="${getSpecialAction(specialAction)} dismissAlert(${alertID});">
                OK
            </button>
        </div>
    </div>
    
`
    document.body.appendChild(alertElement);    
    return alertElement.getAttribute('id');
}

function dismissAlert(caller) {
    document.getElementById(caller).querySelector(`.alertButton`).classList.add('tapped');
    document.getElementById(caller).classList.add('dismissed');

    document.getElementById(caller).addEventListener('animationend', (event) => {
        if (event.animationName == 'alertOut') {
            document.getElementById(caller).remove();
        }
    })
    preventScroll(false);
}

//#endregion

// Function to Generate a random 6 digit id
function generateID(length) {
    var id = Math.floor(Math.random() * (10 ** length));
    if (document.getElementById(id)) {
        generateID(length);
    } else {
        return id;
    }
}

// Function to prevent scrolling while alert is active
function preventScroll(bool) {
    if (bool) document.body.style.touchAction = 'none' 
    if (!bool) document.body.style.touchAction = 'auto';
}

function intervalLoop() {
    document.querySelector('.img-reference').classList.toggle('visible');
    console.log('interval');

    setTimeout(intervalLoop, 500);
}

// Load Pages
async function loadPage(page, args, isCache) {
    // Check for Arguments
    if (!args) args = "";
    let pageID = 0;
    let pageArgs = args;
    pageArgs.page = page;

    // Check for existing open pages in the URL params, and then increment the page number to be one above the last page
    for (let i = 0; i < Object.keys(URLparams).length; i++) {
        if (Object.keys(URLparams)[i].includes('page')) {
            pageID++;
        }
    }

    if (!isCache) {
        updateURLParams('add', [`page${pageID}`, JSON.stringify(pageArgs)]);
    }

    await fetch('/pages/' + page + '.html').then(response => {
        if (!response.ok) {
            if (response.status == 404) {
                console.error(response);
                throw new Error(response.status);
            }
        } else {
            return response.text();
        }
    }).then(data => {
        let fetchedHTML = document.createElement('html');
        fetchedHTML.innerHTML = data;
        let subBody = document.createElement('section');
        subBody.setAttribute('id', page + "-" + pageArgs.id);
        subBody.setAttribute('class', 'sub-body');
        subBody.innerHTML = fetchedHTML.querySelector('body').innerHTML;
        // window.args = args;
        if (page == 'tasklist' && isCache) {
            if (fetchedTasks != undefined) {
                fetchedTasks.forEach(element => {
                    if (args.id == element.id) {
                        subBody.querySelector('.section-header > .content > .left > h1').innerHTML = element.name; 
                    }
                })
            } else {
                return null;
            }
        } else {
            subBody.querySelector('.section-header > .content > .left > h1').innerHTML = getNameFromTaskQuery(args.id, false); 
        }
        subBody.querySelector(".section-header > .options > .left").insertBefore(createElement('a', [['class', 'back-button'], ['onclick', `closePage('${JSON.stringify(pageArgs)}')`]], `<img src="assets/icons/arrow.svg" alt="Back Button" style="width: 1.5rem" class="mirrored icon-inline"><label>${getNameFromTaskQuery(args.parentSection, true)}</label>`), subBody.querySelector(".section-header > .options > .left").firstChild);
        document.body.appendChild(subBody);
        fetchedHTML.querySelector('meta[name="theme-color"]') ? baseThemeColor.setAttribute('content', fetchedHTML.querySelector('meta[name="theme-color"]').getAttribute('content')) : null;
        fetchedHTML.querySelector('body').getAttribute('style') ? document.body.setAttribute('style', fetchedHTML.querySelector('body').getAttribute('style')) : document.body.removeAttribute('style');
        if (fetchedHTML.querySelectorAll('script').length > 0) {
            fetchedHTML.querySelectorAll('script').forEach(element => {
                var script = document.createElement('script');
                element.getAttribute('src') ? script.setAttribute('src', element.getAttribute('src')) : null;
                script.classList.add('section-script');
                script.innerHTML = element.innerHTML;
                document.body.appendChild(script);
                sectionScripts = document.querySelectorAll('.section-script');
            });
        }
        scrollabilityUpdate();
    }).catch(error => {
        console.error(error);
    });
}

function closePage(pageArgs) {
    // Check if the pageArgs uses single quotes instead of double quotes, and then replace them
    if (pageArgs.includes("'")) {
        pageArgs = pageArgs.replace(/'/g, '"');
    } 
    pageArgs = JSON.parse(pageArgs);
    let page = "#" + pageArgs.page + "-" + pageArgs.id;
    updateURLParams('remove', pageArgs);
    document.querySelector(page).remove();
}

// Simple function that grabs the classlist of an element and returns it as a selector
function grabClassesAsSelector(element) {
    let classes = element.classList;
    let selector = '';
    classes.forEach(element => {
        selector += `.${element}`;
    });
    return selector;
}

function grabElementAsSelector(element) {
    let selector = '';
    selector += `${element.tagName.toLowerCase()}${grabClassesAsSelector(element)}#${element.id}`;
    return selector;
}

function getNameFromTaskQuery(query, isList) {
    let taskName;
    if (isList) {
        // Lazy patch.
        if (document.querySelector(`${query} > .section-header > .content > h1`) == undefined) {
            taskName = "Tasklists";
        } else {
            taskName = document.querySelector(`${query} > .section-header > .content > h1`).innerHTML;
        }

    } else {
        fetchedTasks.forEach(element => {
            if (query == element.id) {
                taskName = element.name;
            }
        });
    }
    return taskName;
}

// intervalLoop();

