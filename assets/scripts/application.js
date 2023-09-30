let footerContent;

async function fetchFooterContent() {
    await fetch('/assets/doc.json')
    .then(response => response.json())
    .then(data => {
        footerContent = document.createElement('footer');
        data.pages.forEach(element => {
            footerContent.innerHTML += `
            <a onclick="loadSection('${element.section}')">
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

// if (window.addEventListener) {
//     addEventListener('DOMContentLoaded', headerVisibilityHandler, false);
//     addEventListener('load', headerVisibilityHandler, false);
//     addEventListener('scroll', headerVisibilityHandler, false);
//     addEventListener('resize', headerVisibilityHandler, false);
// }

// window.addEventListener("scroll", headerVisibilityHandler)

fetchFooterContent();