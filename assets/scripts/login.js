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
        response = request.json();
    });

    console.log(response);
}
