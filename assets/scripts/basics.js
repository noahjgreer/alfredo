// Generic References
var hammerDocument = Hammer(document);
var debugMode = true;
var previousThemeColor = document.querySelector('meta[name="theme-color"]').getAttribute('content');

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

async function sendGetRequest(object) {
    // Since we can't pass a body into the GET request, we have to send the object as a query string
    // This is done by converting the object into a query string, and then appending it to the URL
    var queryString = '';
    Object.keys(object).forEach(element => {
        queryString += `${element}=${object[element]}&`;
    });
    // Remove the last & from the query string
    queryString = queryString.slice(0, -1);

    // Set the URL to the new URL with the query string
    var url = `https://${localStorage.getItem('fetchLoc')}:3001/?${queryString}`;

    return await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        }
    }).then(response => {
        responseHandler(response);

        return response.json();
    }).then(data => {
        return data;
    }).catch(error => {
        console.error(error);
    });
}


function updateURLParamsObject() {
    if (!window.location.search == '') {
        window.location.search.replace('?', '').split('&').forEach(element => {
            URLparams[element.split('=')[0]] = element.split('=')[1];
        });  
    }
}

function removeCommentsFromJSON(jsonString) {
    // Remove single line comments
    jsonString = jsonString.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments
    jsonString = jsonString.replace(/\/\*[\s\S]*?\*\//gm, '');
    return jsonString;
}

function responseHandler(response) {
    if (!response.ok) {
        switch (response.status) {
            case 401:
                callAlert('Verification Failed', "Your authentication token is invalid. You will now return to the login page", function () {
                    window.location.href = 'index.html';
                });
                console.log(response);
                break;
            default:
                callAlert('An Error Occurred: ' + response.status, "While fetching your tasks, the server sent back a bad response: " + response.statusText);
        }
    }
}

/**
 * Sends a POST request to a specified URL with the provided body.
 *
 * @param {Object} body - The body of the POST request, which will be stringified into JSON.
 * @returns {Promise<Object>} A promise that resolves with the data from the response, parsed as JSON.
 * @throws {Error} Will throw an error if the fetch request fails for any reason.
 */
async function simpleFetch(body) {
    return await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(response => {
        responseHandler(response);

        return response.json();
    }).then(data => {
        return data;
    }).catch(error => {
        console.error(error);
    });
}

function updateSegmentedControl(call, element) {
    switch (call) {
        case 'init':
            // Set Default Active
            // document.querySelectorAll('.seg-control').forEach(element => {
            //     element.querySelector('.seg-control-item:not(.seg-control-spacer)').classList.add('active');
            // });

            // Segment Control Spacers
            document.querySelectorAll('.seg-control').forEach(element => {
                // Remove all previous spacers
                element.querySelectorAll('.seg-control-spacer').forEach(element => {
                    element.remove();
                });

                // Add spacers to the segmented control, but not around the active element, or the last element
                element.querySelectorAll('.seg-control-item').forEach(element => {
                    if (!element.classList.contains('active') && !element.isSameNode(element.parentElement.lastElementChild)) {
                        if (!element.nextElementSibling.classList.contains('active')) {
                            element.insertAdjacentHTML('afterend', '<div class="seg-control-spacer"></div>');
                        }
                    }
                });
            });
            break;
        case 'updateActive':
            // Remove all previous active elements
            element.parentElement.querySelectorAll('.seg-control-item').forEach(element => {
                element.classList.remove('active');
            });
            // Set new active element
            element.classList.add('active');

            updateSegmentedControl('spacers');
            break;
        case 'spacers':
            // Segment Control Spacers
            document.querySelectorAll('.seg-control').forEach(element => {
                // Remove all previous spacers
                element.querySelectorAll('.seg-control-spacer').forEach(element => {
                    element.remove();
                });

                // Add spacers to the segmented control, but not around the active element, or the last element
                element.querySelectorAll('.seg-control-item').forEach(element => {
                    if (!element.classList.contains('active') && !element.isSameNode(element.parentElement.lastElementChild)) {
                        if (!element.nextElementSibling.classList.contains('active')) {
                            element.insertAdjacentHTML('afterend', '<div class="seg-control-spacer"></div>');
                        }
                    }
                });
            });
            break;
    }    
}

/**
 * Updates the URL parameters based on the provided method and object.
 *
 * @param {string} method - The method to use for updating the URL parameters. 
 *                          This can be "add", "set", "get", "reset", or "remove".
 * @param {(string|Object)} object - The object to use for updating the URL parameters. 
 *                                   If a string is provided, it should be in the format "key=value".
 *                                   If an object is provided, it should be in the format {key: value}.
 *                                   If an array is provided, it should be in the format [[key1, value1], [key2, value2], ...].
 */
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
        case "get":
            return URLparams;
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

/**
 * Simply updates the section parameters cache in localStorage for a specific section, taking from the window URL bar.
 *
 * @param {string} section - The name of the section for which to update the parameters cache to.
 */
function updateSectionParamsCache(section) {
    let windowLocationSearchFormatted = window.location.search.split('&');
    for (let i = 0; i < windowLocationSearchFormatted.length; i++) {
        if (i == 0) {
            windowLocationSearchFormatted[i] = "?tab=" + section;
        }
    }
    // Merge each element in the windowLocationSearchFormatted array into one string
    windowLocationSearchFormatted = windowLocationSearchFormatted.join('&');
    sectionParamsCache[section] = windowLocationSearchFormatted + window.location.hash;
    localStorage.setItem('sectionParamsCache', JSON.stringify(sectionParamsCache));
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
/**
 * Creates a new HTML element with the specified attributes and inner text.
 *
 * @param {string} nodetype - The type of the HTML element to create (e.g., 'div', 'span', 'a').
 * @param {Array<Array<string>>} attributes - An array of attribute pairs, where each pair is an array of two strings: the attribute name and value.
 * @param {string} [innertext] - The inner text to set for the new element. If not provided, the element will be created without any inner text.
 * @returns {HTMLElement} The newly created HTML element.
 */
function createElement(nodetype, attributes, innertext) {
    var node = document.createElement(nodetype);
    if (attributes != undefined) {
        attributes.forEach(element => {
            if (element.length != 2) {
                node.setAttribute(element[0], "");
            } else {
                node.setAttribute(element[0], element[1]);
            }
        });
    }
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
    // Set the document theme color to match the overlay
    var overlayColor = 'rgba(0, 0, 0, 0.425)';
    var baseThemeColor = document.querySelector('meta[name="theme-color"]').getAttribute('content');
    var newThemeColor = blend_colors(baseThemeColor, rgbToHex(rgbaToRgb(overlayColor)), 0.5);

    previousThemeColor = baseThemeColor;

    document.querySelector('meta[name="theme-color"]').setAttribute('content', newThemeColor);

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

/*
    Courtesy of https://coderwall.com/p/z8uxzw/javascript-color-blender
    blend two colors to create the color that is at the percentage away from the first color
    this is a 5 step process
        1: validate input
        2: convert input to 6 char hex
        3: convert hex to rgb
        4: take the percentage to create a ratio between the two colors
        5: convert blend to hex
    @param: color1      => the first color, hex (ie: #000000)
    @param: color2      => the second color, hex (ie: #ffffff)
    @param: percentage  => the distance from the first color, as a decimal between 0 and 1 (ie: 0.5)
    @returns: string    => the third color, hex, represenatation of the blend between color1 and color2 at the given percentage
*/
function blend_colors(color1, color2, percentage)
{
    /*
    convert a Number to a two character hex string
    must round, or we will end up with more digits than expected (2)
    note: can also result in single digit, which will need to be padded with a 0 to the left
    @param: num         => the number to conver to hex
    @returns: string    => the hex representation of the provided number
    */
    function int_to_hex(num)
    {
        var hex = Math.round(num).toString(16);
        if (hex.length == 1)
            hex = '0' + hex;
        return hex;
    }

    // check input
    color1 = color1 || '#000000';
    color2 = color2 || '#ffffff';
    percentage = percentage || 0.5;

    // 1: validate input, make sure we have provided a valid hex
    if (color1.length != 4 && color1.length != 7)
        throw new Error('colors must be provided as hexes');

    if (color2.length != 4 && color2.length != 7)
        throw new Error('colors must be provided as hexes');    

    if (percentage > 1 || percentage < 0)
        throw new Error('percentage must be between 0 and 1');


    // 2: check to see if we need to convert 3 char hex to 6 char hex, else slice off hash
    //      the three character hex is just a representation of the 6 hex where each character is repeated
    //      ie: #060 => #006600 (green)
    if (color1.length == 4)
        color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
    else
        color1 = color1.substring(1);
    if (color2.length == 4)
        color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
    else
        color2 = color2.substring(1);   

    // console.log('valid: c1 => ' + color1 + ', c2 => ' + color2);

    // 3: we have valid input, convert colors to rgb
    color1 = [parseInt(color1[0] + color1[1], 16), parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
    color2 = [parseInt(color2[0] + color2[1], 16), parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];

    // console.log('hex -> rgba: c1 => [' + color1.join(', ') + '], c2 => [' + color2.join(', ') + ']');

    // 4: blend
    var color3 = [ 
        (1 - percentage) * color1[0] + percentage * color2[0], 
        (1 - percentage) * color1[1] + percentage * color2[1], 
        (1 - percentage) * color1[2] + percentage * color2[2]
    ];

    // console.log('c3 => [' + color3.join(', ') + ']');

    // 5: convert to hex
    color3 = '#' + int_to_hex(color3[0]) + int_to_hex(color3[1]) + int_to_hex(color3[2]);

    // console.log(color3);

    // return hex
    return color3;
}

function rgbToHex(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r, g, b)" into [r, g, b]
    rgb = rgb.substr(4).split(")")[0].split(sep);

    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

function rgbaToRgb(rgba) {
    // Remove "rgba(", ")" and spaces, then split into an array
    let parts = rgba.substring(rgba.indexOf("(") + 1, rgba.lastIndexOf(")")).split(/,\s*/),
    r = parseInt(parts[0]),
    g = parseInt(parts[1]),
    b = parseInt(parts[2]),
    a = parts[3] ? parseFloat(parts[3]) : 1;

    // Assuming a white background, calculate the new RGB values
    let rNew = Math.round((1 - a) * 255 + a * r);
    let gNew = Math.round((1 - a) * 255 + a * g);
    let bNew = Math.round((1 - a) * 255 + a * b);

    return `rgb(${rNew}, ${gNew}, ${bNew})`;
}

function dismissAlert(caller) {
    document.getElementById(caller).querySelector(`.alertButton`).classList.add('tapped');
    document.getElementById(caller).classList.add('dismissed');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', previousThemeColor);

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
        fetchFromCategory('tasks', pageArgs.id, subBody.querySelector('.tasklist'), false);
        if (page == 'tasklist' && isCache) {
            if (Object.keys(fetchedCategories.tasks).length != 0) {
                let fetchedTaskLists = parseDatabaseToFormat('lists', 'tasks');
                fetchedTaskLists.forEach(element => {
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
        parseDatabaseToFormat('lists', 'tasks').forEach(element => {
            if (query == element.id) {
                taskName = element.name;
            }
        });
    }
    return taskName;
}

function parseDatabaseToFormat(format, category) {
    let response;
    switch (format) {
        case 'lists':
            response = [];
            // Push the ALL tasklist to the array
            response.push(fetchedCategories[category].all.properties);
            // Push all other lists to the array
            // First check if there are any lists
            if (fetchedCategories[category].all.lists.length != 0 && fetchedCategories[category].all.lists.length != undefined) {
                fetchedCategories[category].all.lists.forEach(list => {
                    response.push(list.properties);
                });
            } else {
                document.querySelector('.tasklist').innerHTML = `<p class="subtle">There are no lists in this category</p>`;
                console.error('There are no lists in this category');
            };
            // Finally, push the completed tasks list, if it exists
            if (fetchedCategories[category].completed) {
                response.push(fetchedCategories[category].completed.properties);
            }
            return response;
        case 'listsFull':
            response = [];
            // Push the ALL tasklist to the array
            response.push(fetchedCategories[category].all);
            // Push all other lists to the array
            fetchedCategories[category].all.lists.forEach(list => {
                response.push(list);
            });
            // Finally, push the completed tasks list
            response.push(fetchedCategories[category].completed);
            return response;
        case 'allTasks':
            response = {
                properties: [],
                tasks: []
            };
            // Push the all tasklist properties to the response array
            response.properties = fetchedCategories[category].all.properties;
            // Push all tasks from the ALL tasklist to the array
            fetchedCategories[category].all.lists.forEach(list => {
                list.tasks.forEach(task => {
                    response.tasks.push(task);
                });
            });
            // Push all tasks from Completed list to the array
            // fetchedCategories[category].completed.tasks.forEach(task => {
            //     response.tasks.push(task);
            // });
            return response;
        default:
            console.error('Invalid format of: "' + format + '"');
            break;
    }
}

function switchToggle(element, event) {
    switch (event) {
        case 'updateBool':
            element.classList.toggle('active');

            var elementStatus
            if (element.classList.contains('active')) {
                elementStatus = true;
            } else {
                elementStatus = false;
            }
            var currentSettings = JSON.parse(localStorage.getItem('settings'));
            currentSettings[element.getAttribute('id')] = elementStatus;
            localStorage.setItem('settings', JSON.stringify(currentSettings));
            updateSettings('store');
    }
    // console.log(element);
    // console.log(event);
}

// Function which passes off the stored local settings to the server for storing, or fetched from the server to the client
async function updateSettings(method) {
    switch (method) {
        case 'fetch':
            await fetch(`https://${localStorage.getItem("fetchLoc")}:3001/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    purpose: "fetchSettings",
                    method: "get",
                    token: localStorage.getItem('token')
                })        
            }).then(response => {
                if (!response.ok) {
                    console.error(response);
                    callAlert('An Error Occurred: ' + response.status, "While processing your request to fetch your settings, the server sent back a bad response: " + response.statusText);
                } else {
                    return response.json();
                }
            }).then(data => {
                localStorage.setItem('settings', JSON.stringify(data));
                // console.log(data);
            }).catch(error => {
                console.error(error);
            });
            break;
        case 'store':
            await fetch(`https://${localStorage.getItem("fetchLoc")}:3001/`, {
                method: "POST",
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify({
                    purpose: "fetchSettings",
                    method: "store",
                    token: localStorage.getItem('token'),
                    settings: JSON.parse(localStorage.getItem('settings'))
                })        
            }).then(response => {
                if (!response.ok) {
                    console.error(response);
                    callAlert('An Error Occurred: ' + response.status, "While processing your request to store your settings, the server sent back a bad response: " + response.statusText);
                } else {
                    return response.json();
                }
            }).then(data => {
                // console.log(data);
            }).catch(error => {
                console.error(error);
            });
            break;
        default:
            console.error('Invalid method of: "' + method + '"');
            break;
    }
}

// intervalLoop();

