// Defining and assigning element variables
const loginButton = document.getElementById('login-button');
const loginForm = document.getElementById('loginForm');
const inputPass = document.getElementById('passwordField');
const inputUser = document.getElementById('userField');

// Detect Enter Key Press during Input
loginForm.addEventListener('keyup', (event) => {
    if (event.keyCode == 13 || event.key == "Enter") { 
        document.activeElement.blur();
        callLogin();
    }
})

// Dismiss Keyboard Focus
loginForm.addEventListener('submit', (event) => {
    document.activeElement.blur();
    event.preventDefault();
    callLogin();
})

// Form Action
function callLogin() {
    // Set Button to Processing
    loginButton.innerHTML = '<img class="loading-wheel" src="assets/icons/wheel2.svg" alt="Loading Wheel">';
    loginButton.classList.add('processing');
    // Listen for Login Button Reversion
    function revertLoginButton() {
        loginButton.style.transition = 'background-color 0.2s ease-out';
        loginButton.classList.remove('processing');

        loginButton.innerHTML = 'Login';
    }

    // Handle Empty Fields
    for (let i = 0; i < loginForm.elements.length; i++) {
        if (loginForm.elements[i].value == '') {
            let alertID = callAlert('Missing Field', 'Please fill in all fields before submitting.', revertLoginButton);
            return;
        }        
    }

    // Prepare and Fetch Request
    var abortController = new AbortController();
    var timeoutId = setTimeout(() => abortController.abort(), 5000);
    var userID = document.getElementById('userField').value;
    var passID = inputPass.value;
    var responseFinal = '';
    fetch('http://192.168.254.64:3000/', {
        signal: abortController.signal,
        method: "POST",
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
            name: userID,
            pass: passID
        })        
    }).then(response => {
        // console.log(response);
        if (response == undefined) {
            callAlert('An Error Occurred:' + "The request is undefined.")
        }
        if (!response.ok) {
            switch (response.status) {
                case 401:
                    callAlert('Verification Failed', "Your username or password is incorrect.", revertLoginButton);
                    console.log(response);
                    return Promise.reject(responseFinal);
                    break;
                default:
                    callAlert('An Error Occurred: ' + response.status, "While processing your request to Login, the server sent back a bad response: " + response.statusText, revertLoginButton);
                    console.log(response);
                    return Promise.reject(responseFinal);
                    break;
            }
        } else {
            responseFinal = response.json();
            var token;
            responseFinal.then(data => {token = data.token}).then(() => {
                localStorage.setItem('token', token);
                localStorage.setItem('name', userID + " " + passID);
                window.location.href = 'app.html';
            });
        }
    }).catch(reason => {
        switch (reason.name) {
            case "AbortError":
                callAlert('Request Timed Out', "While processing your request to Login, the server timed out. Please try again or contact support.", revertLoginButton);
                console.error(reason);
                break;
            default:
                console.error(reason);
                break;
        }
    })

    // console.log(response);
}

// Debug Area
// document.addEventListener('DOMContentLoaded', () => {
//     loginForm.elements[0].value = "fat";
//     loginForm.elements[1].value = "fat";
//     callLogin();
// })