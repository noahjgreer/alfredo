let footerContent;
let firstPageLoad = true;
let baseThemeColor = document.querySelector('meta[name="theme-color"]');

// Autoload Tasks on page load
// document.addEventListener('load', loadSection('tasks'));
debugMode ? document.addEventListener('load', loadSection('testificate')) : document.addEventListener('load', loadSection('tasks'));


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
        let content = document.querySelector('section');
        let fetchedHTML = document.createElement('html');
        let tabs = document.querySelectorAll('footer > a');
        let tab = document.querySelector(`footer > a#${section}`);
        console.log(tabs)
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
            fetchedHTML.innerHTML = data;
            content.innerHTML = fetchedHTML.querySelector('body').innerHTML;
            fetchedHTML.querySelector('meta[name="theme-color"]') ? baseThemeColor.setAttribute('content', fetchedHTML.querySelector('meta[name="theme-color"]').getAttribute('content')) : null;
            fetchedHTML.querySelector('body').getAttribute('style') ? document.body.setAttribute('style', fetchedHTML.querySelector('body').getAttribute('style')) : document.body.removeAttribute('style');
            if (fetchedHTML.querySelectorAll('script').length > 0) {
                fetchedHTML.querySelectorAll('script').forEach(element => {
                    var script = document.createElement('script');
                    script.innerHTML = element.innerHTML;
                    document.body.appendChild(script);
                });
            }
            scrollabilityUpdate();
            console.log(data);
        }).catch(error => {
            if (error == "Error: 404") {
                callAlert('404: Page Not Found', 'The requested section was not found. Please try again.');
            }
            console.log(error);
            content.innerHTML = '<h1>404</h1>';
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
