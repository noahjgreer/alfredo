const loginButton = document.getElementById('login-button');
const inputUser = document.getElementById('userField');
const inputPass = document.getElementById('passwordField');

async function callLogin() {
    var userID = inputUser.value;
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
