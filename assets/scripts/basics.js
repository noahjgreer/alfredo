// console.log(document.getElementsByClassName('img').item);

// document.getElementsByClassName('img').item.setAttribute('draggable', false);

// .setAttribute('draggable', false);

var biInputElements = document.querySelectorAll('.bi-input-container');

biInputElements.forEach((element) => {
    console.log(element.children[0].outerHTML);
    element.children[0].outerHTML += `<div class="input-span"></div>`
});