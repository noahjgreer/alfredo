let footerContent;
let defaultSection = 'tasks';
let firstPageLoad = true;
let baseThemeColor = document.querySelector('meta[name="theme-color"]');
let sectionScripts = document.querySelectorAll('.section-script');
let sectionParamsCache = localStorage.getItem('sectionParams') ? JSON.parse(localStorage.getItem('sectionParams')) : {};
let fetchedCategories = {
    tasks: {},
    routines: {},
    events: {}
};
let listableSections = ['tasks', 'routines', 'events'];

// Fetch tasks from default section on page load
async function init() {
    let taskBody = await loadSection('tasks');
    console.log(taskBody); // Log the taskBody element to the console
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
        data.pages.forEach(element => {
            footerContent.innerHTML += `
            <a onclick="loadSection('${element.section}')" id="${element.section}">
                <img src="${element.icon}" alt="" class="footer-icon">
                <caption>${element.name}</caption>
            </a>`;
        });
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

async function loadSection(section) {
    if (firstPageLoad) {
            // Clear URL Params on first page load to prevent unsolved errors.
            updateURLParams('reset');
            console.log('the big');

            // Check for Token
            if (localStorage.getItem('token') != null) {
                console.log('token found');
                await fetchFooterContent().then(() => {
                    firstPageLoad = false;
                });
            } else {
                console.log('token not found');
                window.location.href = 'index.html';
            }
        }
        // Cache Current Section Params
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
        let tabs = document.querySelectorAll('footer > a');
        let tab = document.querySelector(`footer > a#${section}`);
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
 * Updates the task list with the given tasks.
 * @param {Array} tasks - An array of task objects to display in the task list.
 * @param {boolean} isLists - A boolean indicating whether the inputted array ("tasks") is a list of tasks, or a list of lists. (Default: false)
 * @returns {void}
 */
function updateTasks(tasks, isLists, taskBody) {
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
            <img src="assets/icons/${element.icon}.svg" alt="" class="icon medium">
            <label for="${taskElement.id}">${element.name}</label>
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
        tasks.tasks.forEach(element => {
            var taskElementBase = 'task';
            taskElement = document.createElement('a');
            taskElement.classList.add('task');
            taskElement.id = element.id;
            taskElement.innerHTML = `
            <div class="check"></div>
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
            taskElement.setAttribute('onclick', `loadPage('${taskElementBase}', ${JSON.stringify(taskElementArgs)}, false)`);
        });
        console.log(tasklist);
    }
}


/**
 * Fetches data from the server for the specified category and updates the task list HTMLElement with the results.
 * @param {string} category - The category to fetch data for (tasks, routines, or events).
 * @param {Array} list - An array of list objects to fetch data for. If left blank, it will fetch all tasks (optional).
 * @param {HTMLElement} taskBody - The task list element to update with the fetched data. If one is not found, the default task list will be used. (optional)
 * @param {boolean} isLists - A boolean indicating whether the tasklist should be updated to only contain lists, or the tasks in the list(s). (Default: false)
 * @returns {void}
 */
async function fetchFromCategory(category, list, taskBody, isLists) {
    let listCopy = list;
    let taskBodyCopy = taskBody;
    console.log(category, listCopy, taskBody, isLists);

    switch (category) {
        case 'tasks':
            taskBody ? taskBody : taskBody = document.querySelector('#tasks .tasklist');
            console.log(taskBody);
            taskBody.id = "lists";
            taskBody.innerHTML = `
            <img class="loading-wheel" src="assets/icons/wheel2.svg" alt="Loading Wheel" style="width: 1.5rem">
            `;
            await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    purpose: "fetchTasks",
                    token: localStorage.getItem('token'),
                    list: list
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
                // console.log(category, listCopy, taskBody, isLists, data.response);
                if (list == undefined) {
                    isListsArray = true;
                    fetchedCategories.tasks = data.response;
                } else {
                    isListsArray = false;
                    if (fetchedCategories.tasks.lists) {
                        fetchedCategories.tasks.lists.forEach(element => {
                            if (element.id == list[0]) {
                                element.tasks = data.response.tasks;
                            }
                        });
                    }
                }
                updateTasks(data.response, isListsArray, taskBodyCopy);
                
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


// if (window.addEventListener) {
//     addEventListener('DOMContentLoaded', headerVisibilityHandler, false);
//     addEventListener('load', headerVisibilityHandler, false);
//     addEventListener('scroll', headerVisibilityHandler, false);
//     addEventListener('resize', headerVisibilityHandler, false);
// }

// window.addEventListener("scroll", headerVisibilityHandler)

init();