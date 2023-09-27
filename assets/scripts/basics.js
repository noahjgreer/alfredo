// console.log(document.getElementsByClassName('img').item);

// document.getElementsByClassName('img').item.setAttribute('draggable', false);

// .setAttribute('draggable', false);

// Prevent Double Tap Zoom
document.addEventListener('touchstart', preventZoom); 

function preventZoom(e) {
    var t2 = e.timeStamp;
    var t1 = e.currentTarget.dataset.lastTouch || t2;
    var dt = t2 - t1;
    var fingers = e.touches.length;
    e.currentTarget.dataset.lastTouch = t2;
  
    if (!dt || dt > 500 || fingers > 1) return; // not double-tap
  
    e.preventDefault();
    e.target.click();
  }

// Get document height

const documentHeight = function () {
    var body = document.body,
    html = document.documentElement;

    var height = Math.max( body.scrollHeight, body.offsetHeight, 
    html.clientHeight, html.scrollHeight, html.offsetHeight );

    return height;
}

// Detect if page isn't bigger than the screen, and then disable scrolling
document.getElementById('debug').innerHTML = (documentHeight() <= window.innerHeight) + new String(documentHeight()) + new String(" " + window.innerHeight) + document.getElementById('debug').innerHTML;
if (documentHeight() <= window.innerHeight) {
    document.body.style.touchAction = 'none';
} else {
    document.body.style.touchAction = 'auto';
}

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
/*
const debugConsole = document.getElementById('debug');

function debugUpdate() {
    // debugConsole.innerHTML = new String(console.logs, console.errors, console.warns, console.debugs);
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
*/
//#endregion

//#region Alert

//Simple function made to create nodes
function createElement(nodetype, id, innertext, className) {
    var node = document.createElement(nodetype);
    if (id) node.setAttribute('id', id);
    if (innertext) node.appendChild(document.createTextNode(innertext));
    if (className) node.setAttribute('class', className);
    return node;
}


// Function to call an alert
function callAlert(messageTitle, messageBody, specialAction) {
    preventScroll(true);
    var alertElement = document.createElement('div');
    function getSpecialAction(specialAction) {
        if (!specialAction == undefined) {
            return specialAction;
        } else {
            return '';
        }
    }
    alertElement.setAttribute('class', 'alertContainer');
    alertElement.setAttribute('id', generateID(6));
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
            <button class="alertButton" id="OK" onclick="dismissAlert(${alertElement.getAttribute('id')}); ${getSpecialAction(specialAction)}">
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

// intervalLoop();