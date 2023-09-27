const loginButton = document.getElementById('login-button');
const loginForm = document.getElementById('loginForm');
const inputPass = document.getElementById('passwordField');
const inputUser = document.getElementById('userField');

// Form Action
loginForm.addEventListener('keyup', (event) => {
    if (event.keyCode == 13 || event.key == "Enter") { 
        document.activeElement.blur();
        callLogin();
    }
})

loginForm.addEventListener('submit', (event) => {
    document.activeElement.blur();
    event.preventDefault();
    callLogin();
})

async function callLogin() {
    loginButton.innerHTML = '<img class="loading-wheel" src="assets/icons/wheel2.svg" alt="Loading Wheel">';
    loginButton.classList.add('processing');

    for (let i = 0; i < loginForm.elements.length; i++) {
        if (loginForm.elements[i].value == '') {
            let alertID = callAlert('Missing Field', 'Please fill in all fields before submitting.');

            // Detect Alert Dismissal
            document.getElementById(alertID).querySelector('.alertButton').addEventListener('click', () => {
                loginButton.classList.remove('processing');
                loginButton.innerHTML = 'Login';
            });
            return;
        }        
    }

    var userID = document.getElementById('userField').value;
    var passID = inputPass.value;
    var response = '';
    console.log(
        JSON.stringify({
            "name": userID,
            "pass": passID
        }       
        )
    )
    var request = await fetch('http://192.168.254.64:3000/', {
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            name: userID,
            pass: passID
        })        
    }).then((request) => {
        if (!request.ok) {
            callAlert('An Error Occurred: ' + request.status, "While processing your request to Login, the server sent back a bad response: " + request.statusText);
            console.log(request);
            return Promise.reject(response);
        } else {
            response = request.json();
        }
    }).catch(reason => {
        callAlert('An Error Occurred: ' + request.status, "While processing your request to Login, the server sent back a bad response: " + request.statusText);
        console.log(reason);
    })

    // console.log(response);
}
