// console.log(document.getElementsByClassName('img').item);

// document.getElementsByClassName('img').item.setAttribute('draggable', false);

// .setAttribute('draggable', false);

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

function callAlert(messageTitle, messageBody) {
    var alertElement = document.createElement('div');
    alertElement.setAttribute('id', 'alertContainer');
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
            <button class="alertButton" id="OK" onclick="console.log('hit')">
                OK
            </button>
        </div>
    </div>
    
`
    document.body.appendChild(alertElement);    

    console.log(alertElement)
}

//#endregion

function intervalLoop() {
    document.querySelector('.img-reference').classList.toggle('visible');
    console.log('interval');

    setTimeout(intervalLoop, 500);
}

// intervalLoop();