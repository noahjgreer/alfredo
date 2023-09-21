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
const debugConsole = document.getElementById('debug');

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
//#endregion

//#region Alert
var alertElement = document.createElement('div').setAttribute('id', "alert");


function callAlert() {
    alertElement.innerHTML =  `
        <p id="alertMessage">
            An error has occurred, please try again later.
        </p>
        <div id="alertOptions">
            <button class="alertButton" id="OK">
                OK
            </button>
        </div>
`
    document.body.innerHTML += alertElement;

    console.log(alertElement)
}
//#endregion

