var options = {
    method: "GET",
    mode: "cors",
    headers: {
        "credentials": "alfredo",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    }
};
var loc = undefined;

async function sendRequest() {
    const fetchIP = await fetch('https://jsonip.com/', {method: "GET"});
    const fetchedIP = await fetchIP.json();

    if (fetchedIP.ip == '47.144.17.228') {
        loc = "192.168.254.64";
    } else {
        loc = '47.144.17.228';
    }

    const response = await fetch(`https://${loc}:3000/`, options);
    const data = await response.text();
    
    console.log(data);
}

        // .then(res => {
        //     if(res.ok) {
        //         console.log('OK')
        //     } else {
        //         console.log(res.status);
        //     }
        // })
        // .then(data => console.log(data));