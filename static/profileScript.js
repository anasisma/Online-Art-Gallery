let clientChanges = {}; //object to save all the changes that have yet to be sent to server

function initializeClientChanges() { //function to reset the local changes object to empty, but with proper format
    clientChanges["name"] = "";
    clientChanges["password"] = "";
    clientChanges["type"] = "";
}

//get the button to submit the modifications related to the store info, then set its onclick function
const submitModifs = document.getElementById("submitModifs");
submitModifs.onclick = function () {
    let name = document.getElementById("nameInput").value;
    let password = document.getElementById("passInput").value;
    let type = document.getElementById("typeSelect").value;
    modifyClientVendor(name, password, type);
};

function modifyClientVendor(username, password, type) { //function to update the stores info
    //each "if" is to check wether we need to update a piece of info or not (depending on if anything was typed in the text input)
    //if needed, modify the inner html of each piece of info then save that change to the local changes object (and overwrite previous changes)
    if (username.length > 0) {
        document.getElementById("nameHeader").innerHTML = "Name: " + username;
        clientChanges["name"] = username;
    } if (password.length > 0) {
        document.getElementById("passHeader").innerHTML = "Password: " + password;
        clientChanges["password"] = password;
    } if (type.length > 0) {
        document.getElementById("typeHeader").innerHTML = "Account type: " + type;
        clientChanges["type"] = type;
    }
    modifyVendor();
}

function modifyVendor() { //sends new vendor info to the server
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            initializeClientChanges(); //reset the local changes object
            window.location.href = "http://localhost:3000/profile"; //refresh the browser page to reset the text inputs and such
        }
    }
    xhttp.open("PUT", `http://localhost:3000/profile`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(clientChanges));
}

const images = document.getElementsByClassName("rmvReview");
for (let i = 0; i < images.length; i++) {
    let fields = (images[i].id).split("-");
    images[i].onclick = function () {
        deleteReview(fields[0], fields[1]);
    }
}

function deleteReview(reviewIndex, artName) {
    let review = { "reviewID": reviewIndex, "artName": artName };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            location.reload();
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("Must be logged in before deleting a review.");
        } else if (this.readyState == 4 && this.status == 403) {//once the response comes back successful
            alert("Cannot delete another users review!");
        }
    }
    xhttp.open("DELETE", `http://localhost:3000/review/`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(review));
}