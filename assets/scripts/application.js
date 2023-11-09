let footerContent;
let defaultSection = 'tasks';
let firstPageLoad = true;
let baseThemeColor = document.querySelector('meta[name="theme-color"]');
let sectionScripts = document.querySelectorAll('.section-script');
let sectionParamsCache = sessionStorage.getItem('sectionParams') ? JSON.parse(sessionStorage.getItem('sectionParams')) : {};
let fetchedCategories = {
    tasks: {},
    routines: {},
    events: {}
};
let listableSections = ['tasks', 'routines', 'events'];

cacheDatabaseHandler('get', 'tasks');

async function databaseLocalStorage(eventType) {
    switch (eventType) {
        case 'init':
            // Check for the precense of a taskDatabase in localStorage
            if (!localStorage.getItem('database')) {
                // If it doesn't exist, ask the server for it
            }
    }
}

function cacheKeyHandler(event, category, key) {
    // Initiate the cacheKeys object
    let cacheKeys;
    
    // Check if the cacheKeys object exists in localStorage
    if (localStorage.getItem(`cacheKeys`)) {
        cacheKeys = JSON.parse(localStorage.getItem(`cacheKeys`));
    } else {
        cacheKeys = {};
    }

    switch (event) {
        case 'get':
            return cacheKeys[category];
            break;
        case 'set':
            // Set the cache key in the object
            cacheKeys[category] = key;

            // Save the cacheKeys object to localStorage
            localStorage.setItem(`cacheKeys`, JSON.stringify(cacheKeys));
            break;
    }
}

function cacheDatabaseHandler(event, category, data) {
    switch (event) {
        case 'get':
            fetchedCategories = JSON.parse(localStorage.getItem(`database`));
            return fetchedCategories;
            break;
        case 'set':
            fetchedCategories = {};
            if (!localStorage.getItem(`database`)) {
                localStorage.setItem(`database`, JSON.stringify({}));
            }
            var newDatabase = JSON.parse(localStorage.getItem(`database`));
            newDatabase[category] = data;
            localStorage.setItem(`database`, JSON.stringify(newDatabase));
            fetchedCategories[category] = data;
            return;
            break;
    }
}


// Fetch tasks from default section on page load
async function init() {
    let taskBody = await loadSection('tasks');
    // fetchFromCategory('tasks', undefined, taskBody, true);
}

// document.addEventListener('DOMContentLoaded', init);

// Load default section on page load, with a extra location dependent on debugMode
// debugMode ? document.addEventListener('load', loadSection('tasks')) : document.addEventListener('load', loadSection(defaultSection));


async function fetchFooterContent() {
    await fetch('/assets/doc.json')
    .then(response => response.json())
    .then(data => {
        footerContent = document.createElement('footer');
        iconContainer = document.createElement('div');
        iconContainer.setAttribute('id', 'icon-container');

        data.pages.forEach(element => {
            iconContainer.innerHTML += `
            <a onclick="loadSection('${element.section}')" id="${element.section}">
                <img src="${element.icon}">
                <p>${element.name}</p>
            </a>`;
        });
        footerContent.appendChild(iconContainer);
        document.body.appendChild(footerContent);
    });
}

let header = document.querySelector('header');

/**
 * A function which checks whether the element is in the viewport or not.
 *
 * @param {HTMLElement} el The element to check
 * @returns {Boolean} Whether the element is in the viewport
 */
function isElementInViewport (el) {
    var rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

/**
 * Returns a function that checks if an element is in the viewport and updates a variable when the visibility changes.
 * @param {HTMLElement} el - The element to check for visibility.
 * @returns {function} A function that checks if the element is in the viewport and updates a variable when the visibility changes.
 */
function onVisibilityChange(el) {
    var old_visible;
    return function () {
        var visible = isElementInViewport(el);
        if (visible != old_visible) {
            old_visible = visible;
        }
    }
}

var headerVisibilityHandler = onVisibilityChange(document.querySelector('#hd0'), function() {
    console.log('visibilitychange')
})

function headerVisibilityHandler() {
    console.log(onVisibilityChange(document.querySelector('#hd0')));
}

/**
 * Validates the presence of required user data in localStorage.
 * If all required data are present, fetches the footer content and sets firstPageLoad to false.
 * If any required data are missing, removes all required data from localStorage and redirects the user to index.html.
 *
 * @returns {Promise} A promise that resolves when the validation is complete.
 */
async function validateUserDataPresence() {
    // Define the items that are required to be in localStorage
    const requiredItems = ['token', 'uuid', 'name', 'settings'];

    // Check if all required items are present in localStorage
    if (requiredItems.every(item => localStorage.getItem(item) !== null)) {
        // If all required items are present, fetch the footer content
        await fetchFooterContent();
        // Set firstPageLoad to false to indicate that the first page load has completed
        firstPageLoad = false;
    } else {
        // If any required item is missing, log an error message to the console
        console.error('Something wasn\'t found!');
        // Remove all required items from localStorage
        requiredItems.forEach(item => localStorage.removeItem(item));
        // Redirect the user to index.html
        window.location.href = 'index.html';
    }
}

async function loadSection(section, args) {
    // Copy the Arguments so that they won't be forgotten
    let newArgs = args;
    
    if (firstPageLoad) {
        // Clear URL Params on first page load to prevent unsolved errors.
        updateURLParams('reset');
        // Check for Token and other User Attributes
        validateUserDataPresence();
    }
    
    // Cache Current Section Params before loading the called section
    previousSection = document.querySelector('section').getAttribute('id') ? document.querySelector('section').getAttribute('id') : defaultSection;
    updateSectionParamsCache(previousSection);

    // Update Section
    // Check for section params in cache, otherwise use default
    if (sectionParamsCache[section]) {
        updateURLParams('set', sectionParamsCache[section]);
        // Recall the cached pages
        for (let i = 0; i < Object.keys(URLparams).length; i++) {
            const element = Object.keys(URLparams)[i];
            if (element.includes('page')) {
                let elementArgs = JSON.parse(decodeURI(URLparams[Object.keys(URLparams)[i]]));
                loadPage(elementArgs.page, elementArgs, true);
            }
        }
    } else {
        updateURLParams('set', ['tab', section]);
    }
    // updateURLParams('set', ['tab', section]);
    document.querySelectorAll('.sub-body').forEach(element => {
        element.remove();
    });
    let content = document.querySelector('section');
    if (section == content.getAttribute('id')) return;        
    let fetchedHTML = document.createElement('html');
    let tabs = document.querySelectorAll('footer > #icon-container > a');
    let tab; 
    tabs.forEach(element => {
       if (element.getAttribute('id') == section) {
           tab = element;
       }
    });
    // let tab = document.querySelector(`footer > #icon-container > a#${section}`);
    tabs.forEach(element => {
        element.classList.remove('selected');
    });
    tab ? tab.classList.add('selected') : null;
    content.setAttribute('id', section);

    content.innerHTML = '';
    var taskBody = await fetch(`/sections/${section}.html`)
    .then(response => {
        if (!response.ok) {
            if (response.status == 404) {
                console.error(response);
                throw new Error(response.status);
            }
        } else {
            return response.text();
        }
    })
    .then(data => {
        // Remove section scripts from previous section
        sectionScripts.forEach(element => {
            element.remove();
        });
        fetchedHTML.innerHTML = data;
        content.innerHTML = fetchedHTML.querySelector('body').innerHTML;
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
        
        // Check for extra args, and load them using loadPage
        if (newArgs) {
            console.log(newArgs.replace(/&quot;/g, '\"'));
            newArgs = JSON.parse(newArgs.replace(/&quot;/g, '\"'));
            loadPage(newArgs.page, newArgs, true);
        }
        scrollabilityUpdate();
        if (listableSections.includes(section)) {
            let taskBody = document.querySelector('#tasks .tasklist'); // Get the taskBody element
            taskBody.id = "lists";
            fetchFromCategory('tasks', undefined, taskBody, true);
            return taskBody;
        }
    }).catch(error => {
        if (error == "Error: 404") {
            callAlert('404: Page Not Found', 'The requested section was not found. Please try again.');
        }
        console.log(error);
        content.innerHTML = '<h1>404</h1>';
    });
    return taskBody;
}

/**
 * Updates the tasklist HTMLElement with the provided tasks array.
 * @param {Array} tasks - An array of task objects to display in the task list.
 * @param {boolean} isLists - A boolean indicating whether the inputted array ("tasks") is a list of tasks, or a list of lists. (Default: false)
 * @param {HTMLElement} taskBody - The task list element to update with the fetched data. If one is not found, the default task list will be used. (optional)
 * @returns {void}
 */
async function updateTasks(tasks, isLists, taskBody) {
    // Check if the inputed array "tasks" is a list of tasks, or a list of lists. 
    // If it is a list of lists, then the isLists parameter should be true.
    if (isLists) {
        // Get the tasklist element
        let tasklist = document.querySelector('#tasks .tasklist');
        // Clear the tasklist
        tasklist.innerHTML = '';
        // Create a variable for the task element
        let taskElement;
        // Loop through the provided tasks array
        tasks.forEach(element => {
            // Create a variable for the base of the task element
            var taskElementBase = 'tasklist';
            // Create the task element
            taskElement = document.createElement('a');
            taskElement.classList.add('task');
            taskElement.classList.add('list');
            taskElement.style.color = element.color;
            taskElement.id = element.id;
            // Set the inner HTML of the task element
            taskElement.innerHTML = `
            <div class="left">
                <img src="assets/icons/${element.icon}.svg" alt="" class="icon medium">
                <label for="${taskElement.id}">${element.name}</label>
            </div>
            <div class="right">
            
            </div>
            `;
            // Append the task element to the tasklist
            tasklist.appendChild(taskElement);
            // Create the arguments for the task element to pass to the loadPage function that runs when the task element is clicked
            var taskElementArgs = {
                parentSection: grabElementAsSelector(document.querySelector(grabClassesAsSelector(taskElement)).closest('section')),
                // Keep in mind that the ID of the tasklist is the ID of the list
                id: element.id,
            };
            // Set the onclick attribute of the task element to load the tasklist page with the arguments
            taskElement.setAttribute('onclick', `loadPage('${taskElementBase}', ${JSON.stringify(taskElementArgs)}, false)`);
        });
    } else {
        let tasklist;
        if (taskBody == undefined) { 
            tasklist = document.querySelector('#tasks .tasklist');
        } else { 
            tasklist = taskBody;
        };
        // let tasklist = document.querySelector('#tasks .tasklist');
        tasklist.innerHTML = '';
        let taskElement;
        // Loop through the provided tasks array, if it contains items
        console.log(taskBody);
        if (taskBody.parentElement.id != 'tasklist-all') {
            if (tasks.tasks.length != 0) {
                tasks.tasks.forEach(element => {
                    var taskElementBase = 'task';
                    taskElement = document.createElement('div');
                    taskElement.classList.add('task');
                    taskElement.id = element.id;
                    taskElement.innerHTML = `
                <a class="check" onclick="markTaskComplete('${element.id}')"></a>
                <div class="task-content">
                    <p>${element.name}</p>
                    <h3>${element.description}</h3>
                </div>
                    `;
                    tasklist.appendChild(taskElement);
                    var taskElementArgs = {
                    parentSection: grabElementAsSelector(document.querySelector(grabClassesAsSelector(taskElement)).closest('section')),
                    id: element.id,
                    };
                    // taskElement.setAttribute('onclick', `loadPage('${taskElementBase}', ${JSON.stringify(taskElementArgs)}, false)`);
                });    
            } else {
            // Set a motivational quote on the page instead
            if (JSON.parse(localStorage.getItem('settings')).motivation) {
                var bibleMotivation = await getMotivation();
                tasklist.innerHTML = `
                <p class="subtle">You're all caught up! <br><br> ${bibleMotivation}</p>
                `;
            } else {
                tasklist.innerHTML = `
                <p class="subtle">You're all caught up!</p>
                `;
            }
            }
        } else {
            if (tasks.lists.length != 0) {
                tasks.lists.forEach(element => {
                    element.tasks.forEach(task => {
                        var taskElementBase = 'task';
                        taskElement = document.createElement('div');
                        taskElement.classList.add('task');
                        taskElement.id = task.id;
                        taskElement.innerHTML = `
                    <a class="check" onclick="markTaskComplete('${task.id}')"></a>
                    <div class="task-content">
                        <p>${task.name}</p>
                        <h3>${task.description}</h3>
                    </div>
                        `;
                        tasklist.appendChild(taskElement);
                        var taskElementArgs = {
                        parentSection: grabElementAsSelector(document.querySelector(grabClassesAsSelector(taskElement)).closest('section')),
                        id: task.id,
                        };
                        // taskElement.setAttribute('onclick', `loadPage('${taskElementBase}', ${JSON.stringify(taskElementArgs)}, false)`);
                    });    
                });
            } else {
                // Set a motivational quote on the page instead
                if (JSON.parse(localStorage.getItem('settings')).motivation) {
                    var bibleMotivation = await getMotivation();
                    tasklist.innerHTML = `
                    <p class="subtle">You're all caught up! <br><br> ${bibleMotivation}</p>
                    `;
                } else {
                    tasklist.innerHTML = `
                    <p class="subtle">You're all caught up!</p>
                    `;
                }
            }
        }
        // console.log(tasklist);
    }
}

/**
 * Creates a new "thing" of the specified type and sends it to the server for database storage.
 *
 * @param {Object} passObject - The object to create. This object should have a 'type' property that specifies the type of the object (e.g., 'task'), and other properties as needed for the object type.
 * @param {Object} [referenceData] - Optional reference data to use when creating the object. If provided, this should be an object with a 'caller' property that refers to the HTML element that initiated the create operation.
 * @returns {Promise} A promise that resolves when the create operation is complete.
 *
 * @throws Will throw an error if the 'type' property of 'passObject' is not recognized.
 */
async function createNew(passObject, referenceData) {
    // Create Variables
    let caller;

    // Map Reference Data
    if (referenceData) {
        Object.keys(referenceData).forEach(element => {
            switch (element) {
                case 'caller':
                    caller = referenceData[element];
                    break;
            }
        });
    }
    console.log(caller);

    // Check Object Type
    switch (passObject.type.toLowerCase()) {
        case 'task':
            // Handle Missing Fields
            if (!passObject.name) {
                callAlert('Missing Field', 'Please enter a name for your task.');
                return;
            }

            // Update the Button Text (if valid)
            if (caller) {
                caller.previousInnerHTML = caller.innerHTML;
                caller.previousBGC = caller.style.backgroundColor;
                caller.innerHTML = `<img src="assets/icons/wheel2.svg" alt="Loading Wheel" style="width: 1.5rem" class="loading-wheel">`;
                caller.classList.toggle('processing');
            }

            // Tell the server to create a new task
            await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    purpose: "createNew",
                    token: localStorage.getItem('token'),
                    object: passObject
                })
            }).then(response => {
                if (!response.ok) {
                    switch (response.status) {
                        case 401:
                            callAlert('Verification Failed', "Your authentication token is invalid. You will now return to the login page", function () {
                                window.location.href = 'index.html';
                            });
                            console.log(response);
                    }
                }
                return response.json();
            }).then(data => {
                // Update the Button Text (if valid)
                if (caller) {
                    // Store the old onclick method
                    caller.previousOnClick = caller.getAttribute('onclick');
                    
                    // Set the background color to green and the text to "Created!"
                    caller.classList.toggle('processing');
                    caller.style.backgroundColor = '#34C759';
                    caller.setAttribute('onclick', `loadSection('tasks', "{&quot;parentSection&quot;: &quot;section#tasks&quot;, &quot;id&quot;: &quot;${data.response}&quot;, &quot;page&quot;:&quot;tasklist&quot;}")`);
                    caller.innerHTML = '<p>Created! <img src="assets/icons/arrow.up.forward.square.svg" alt="View Task in List" class="icon-inline semi-big" color-filter="white"></p>';
                    setTimeout(() => {
                        // Reset the background color and text after 5 seconds
                        caller.setAttribute('onclick', caller.previousOnClick);
                        caller.style.backgroundColor = caller.previousBGC;
                        caller.innerHTML = caller.previousInnerHTML;
                    }, 50000);
                }
                console.log(data);
                if (data.response) {
                    // If the task was created successfully, fetch the new task list
                    fetchFromCategory('tasks', undefined, document.querySelector('#tasks .tasklist'), true);
                }
            });
            break;
        default:
            console.error('Invalid Type');
            break;
    }
}

/**
 * Fetches data from the server for the specified category and updates the task list HTMLElement with the results.
 * @param {string} category - The category to fetch data for (tasks, routines, or events).
 * @param {Array} list - An array of list objects to fetch data for. If left blank, it will fetch all tasks (optional).
 * @param {HTMLElement} taskBody - The task list element to update with the fetched data. If one is not found, the default task list will be used. (optional)
 *                                  If the returnData parameter is set to true, no tasks will be set to a body element.
 * @param {boolean} isLists - A boolean indicating whether the tasklist should be updated to only contain lists, or the tasks in the list(s). (Default: false)
 * @param {boolean} returnData - A boolean indicating whether the function should return the fetched data. (Default: false)
 * @returns {void}
 */
async function fetchFromCategory(category, list, taskBody, isLists, returnData) {
    let listCopy = list;
    let taskBodyCopy = taskBody;

    switch (category) {
        case 'tasks':
            if (!returnData && (!window.location.search == '?tab=new')) {
                taskBody ? taskBody : taskBody = document.querySelector('#tasks .tasklist');
                taskBody.id = "lists";
                taskBody.innerHTML = `
                <img class="loading-wheel" src="assets/icons/wheel2.svg" alt="Loading Wheel" style="width: 1.5rem">
                `;
            }
            
            

            return await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    purpose: "fetchTasks",
                    token: localStorage.getItem('token'),
                    list: list,
                    category: category,
                    cacheKey: cacheKeyHandler('get', category)
                })
            }).then(response => {
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
                return response.json();
            }).then(data => {
                let isListsArray;
                let dataResponse;
                let parsedDataResponse = [];
                // console.log(category, listCopy, taskBody, isLists, data.response);

                // Update the cache key and determine the data response
                if (data.cacheKey != cacheKeyHandler('get', category) && data.cacheKey != undefined) {
                    cacheKeyHandler('set', category, data.cacheKey);
                    cacheDatabaseHandler('set', category, data.response);
                    console.log(dataResponse);
                }

                cacheDatabaseHandler('get');
                // dataResponse = fetchedCategories.tasks;
                dataResponse = parseDatabaseToFormat('listsFull', 'tasks');


                // Parse the data response
                if (listCopy) {
                    isListsArray = false;
                    // dataResponse.all.lists.forEach(element => {
                    //     if (element.properties.id == list) {
                    //         parsedDataResponse = element;
                    //     }
                    // });
                    dataResponse.forEach(element => {
                        if (element.properties.id == list) {
                            parsedDataResponse = element;
                        }
                    });
                    console.log("is a list");
                } else { // If no list is specified, then the response is all lists
                    isListsArray = true;
                    parsedDataResponse = parseDatabaseToFormat('lists', 'tasks');
                }

                /*if (list == undefined) {
                    fetchedCategories.tasks = dataResponse.tasks;
                } else {
                    if (fetchedCategories.tasks.lists) {
                        fetchedCategories.tasks.lists.forEach(element => {
                            if (element.id == list[0]) {
                                element.tasks = data.response.tasks;
                            }
                        });
                    }
                }*/
                if (!returnData) {
                    console.log(parsedDataResponse);
                    updateTasks(parsedDataResponse, isListsArray, taskBodyCopy);
                } else {
                    return parsedDataResponse;
                }
            })
            // .catch(err => {
            //     callAlert('An Error Occurred', "While fetching your tasks, the server sent back an error: " + err, window.location.href = 'index.html');
            // })    
            break;
        case 'routines':
            await fetchRoutines(list, taskBody);
            break;
        case 'events':
            await fetchEvents(list, taskBody);
            break;
        default:
            console.error('Invalid Category');
            break;
    }
    if (!list) {
    }
}

async function markTaskComplete(taskID) {
    console.trace("markTaskComplete called");
    if (typeof taskID != 'string') {
        console.error('Invalid taskID');
        return;
    } else {
        await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                purpose: "markTaskComplete",
                token: localStorage.getItem('token'),
                taskID: taskID
            })
        }).then(response => {
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
            console.log(response);
            return response.json();
        }).then(data => {
            if (data) {
                var taskParent = data.response.taskParent;
                var wasPreviouslyCompleted = data.response.wasPreviouslyCompleted;
                if (!wasPreviouslyCompleted) {
                    fetchFromCategory('tasks', taskParent, document.querySelector(`#tasklist-${taskParent}>.tasklist`), false);
                } else {
                    fetchFromCategory('tasks', 'completed', document.querySelector(`#tasklist-completed>.tasklist`), false);
                    // document.querySelector(`#${taskID}`).remove();
                }
            }
        })
    }
}

async function getMotivation() {
    return await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            purpose: "getMotivation"
        })
    }).then(response => {
        if (!response.ok) {
            console.log(response);
            callAlert('An Error Occurred: ' + response.status, "While fetching your tasks, the server sent back a bad response: " + response.statusText);
        }
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data.response);
        return data.response;
    });
}    // let response = await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //         purpose: "getMotivation"
    //     })
    // });
    // let data = await response.json();
    // return data.response;

// if (window.addEventListener) {
//     addEventListener('DOMContentLoaded', headerVisibilityHandler, false);
//     addEventListener('load', headerVisibilityHandler, false);
//     addEventListener('scroll', headerVisibilityHandler, false);
//     addEventListener('resize', headerVisibilityHandler, false);
// }

// window.addEventListener("scroll", headerVisibilityHandler)

init();