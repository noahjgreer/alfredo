var taskBody = document.querySelector('#tasks .tasklist'); 
var fetchedTasks;

document.addEventListener('load', fetchTasks);

async function fetchTasks(list) {
    if (!list) {
        list = undefined;
        taskBody.innerHTML = `
        <img class="loading-wheel" src="assets/icons/wheel2.svg" alt="Loading Wheel" style="width: 1.5rem">
        `;
        await fetch(`https://${localStorage.getItem('fetchLoc')}:3001/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                purpose: "fetchTasks",
                token: localStorage.getItem('token'),
                list: list
            })
        }).then(response => {
            if (!response.ok) {
                switch (response.status) {
                    case 401:
                        callAlert('Verification Failed', "Your authentication token is invalid. You will now return to the login page", function () {
                            window.location.href = 'index.html';
                        });
                        console.log(response);
                        break;
                    default:
                        callAlert('An Error Occurred: ' + response.status, "While fetching your tasks, the server sent back a bad response: " + response.statusText);
                }
            }
            return response.json();
        }).then(data => {
            updateTasks(data.response, true);
        })
        // .catch(err => {
        //     callAlert('An Error Occurred', "While fetching your tasks, the server sent back an error: " + err, window.location.href = 'index.html');
        // })
    }
}

fetchTasks();