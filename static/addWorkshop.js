//get the button to create vendors and set its onclick
const submitButton = document.getElementById("submitWorkshop");
submitButton.onclick = function () {
    let nameInput = document.getElementById("nameInput").value;
    createWorkshop(nameInput);
};

function createWorkshop(name) { //sends new art to the server
    if (name) { //check if all needed info is not blank
        //create vendor object with data from arguments
        let workshop = {"name": name};

        //send object to server
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
                let result = JSON.parse(xhttp.response);
                window.location.href = `http://localhost:3000/workshop/${result["artist"]}/${result["id"]}`;
            } else if (this.readyState == 4 && this.status == 403) {
                alert("Must be an artist to create a workshop.")
            } else if (this.readyState == 4 && this.status == 401) {
                alert("Must be logged in to do this.")
            }
        }
        xhttp.open("POST", "http://localhost:3000/addWorkshop", true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(workshop));
    } else {
        alert("Please fill in all the info to create a new vendor.")
    }
}