

//get the button to submit the modifications related to the store info, then set its onclick function
const signInButton = document.getElementById("signInButton");
signInButton.onclick = function () {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    sendUser(username, password);
};

//get the button to submit the modifications related to the store info, then set its onclick function
const registerButton = document.getElementById("registerButton");
registerButton.onclick = function () {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    createUser(username, password);
};

function sendUser(username, password) { //sends new vendor info to the server
    let user = {};
    user.username = username;
    user.password = password;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            window.location.href = `http://localhost:3000/gallery`;
        } else if (this.readyState == 4 && this.status == 403) {
            alert("Invalid credentials!");
        }
    }
    xhttp.open("POST", "http://localhost:3000/login", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(user));
}

function createUser(username, password) { //sends new vendor info to the server
    let newUser = {};
    newUser.username = username;
    newUser.password = password;
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            let result = JSON.parse(xhttp.response);
            sendUser(result.username, result.password);
        } else if (this.readyState == 4 && this.status == 400) {
            alert("A user with this name already exists!");
        }
    }
    xhttp.open("PUT", "http://localhost:3000/login", true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(newUser));
}