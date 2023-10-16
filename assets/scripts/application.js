let footerContent;
let firstPageLoad = true;
let baseThemeColor = document.querySelector('meta[name="theme-color"]');
let sectionScripts = document.querySelectorAll('.section-script');

// Autoload Tasks on page load
// document.addEventListener('load', loadSection('tasks'));
debugMode ? document.addEventListener('load', loadSection('tasks')) : document.addEventListener('load', loadSection('tasks'));


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

function isElementInViewport (el) {

    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
    );
}

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
        if (localStorage.getItem('token') != null) {
            console.log('token found');
            await fetchFooterContent().then(() => {
                firstPageLoad = false;
                loadSection(section);
            });
        } else {
            console.log('token not found');
            window.location.href = 'index.html';
        }
    } else {
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
        await fetch(`/sections/${section}.html`)
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
        }).catch(error => {
            if (error == "Error: 404") {
                callAlert('404: Page Not Found', 'The requested section was not found. Please try again.');
            }
            console.log(error);
            content.innerHTML = '<h1>404</h1>';
        });    
    }
}

function updateTasks(tasks, isList) {
    if (isList) {
        let tasklist = document.querySelector('#tasks .tasklist');
        tasklist.innerHTML = '';
        let taskElement;
        tasks.forEach(element => {
            taskElementArgs = [{caller: element.id}];
            taskElement = document.createElement('a');
            taskElement.classList.add('task');
            taskElement.classList.add('list');
            taskElement.style.color = element.color;
            taskElement.id = element.id;
            taskElement.setAttribute('onclick', `loadPage('task-page', ${JSON.stringify(taskElementArgs)}, ${tasklist.id})`);
            taskElement.innerHTML = `
            <img src="assets/icons/${element.icon}.svg" alt="" class="icon medium">
            <label for="${taskElement.id}">${element.name}</label>
            `;
            tasklist.appendChild(taskElement);
        });
    }
}

// if (window.addEventListener) {
//     addEventListener('DOMContentLoaded', headerVisibilityHandler, false);
//     addEventListener('load', headerVisibilityHandler, false);
//     addEventListener('scroll', headerVisibilityHandler, false);
//     addEventListener('resize', headerVisibilityHandler, false);
// }

// window.addEventListener("scroll", headerVisibilityHandler)
