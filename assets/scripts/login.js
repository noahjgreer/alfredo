const loginButton = document.getElementById('login-button');
const inputPass = document.getElementById('passwordField');
const inputUser = document.getElementById('userField');

async function callLogin() {
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
