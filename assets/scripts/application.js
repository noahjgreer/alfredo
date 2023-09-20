let footerContent = `
<footer>
    <a href="">
        <img src="/assets/icons/plus.svg" alt="" class="footer-icon">
        <caption>Add Task</caption>
    </a>
    <a href="">
        <img class="footer-icon" src="/assets/icons/checklist.svg" alt="">
        <caption>Tasks</caption>
    </a>        
    <a href="">
        <img src="/assets/icons/gear.svg" alt="" class="footer-icon">
        <caption>Settings</caption>
    </a>
</footer>
`
let header = document.querySelector('header');

function setFooter() {
    document.querySelector('body').innerHTML += footerContent;
}

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

setFooter();

window.addEventListener("scroll", headerVisibilityHandler)