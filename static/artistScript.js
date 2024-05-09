const followButton = document.getElementById("followButton");
followButton.onclick = function () {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            alert("Artist followed/unfollowed."); //alert to tell user changes were saved
            location.reload();
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("You must be logged in to follow an artist."); //alert to tell user changes were saved
        } else if (this.readyState == 4 && this.status == 403) {//once the response comes back successful
            alert("You cannot follow yourself."); //alert to tell user changes were saved
        }
    }
    xhttp.open("PUT", `http://localhost:3000/artists/${data["name"]}`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
};

const images = document.getElementsByClassName("joinWrkshp");
for (let i = 0; i < images.length; i++) {
    let fields = (images[i].id).split("-");
    images[i].onclick = function () {
        joinWorkshop(fields[1]);
    }
}

function joinWorkshop(workshopIndex) {
    let workshop = { "workshopID": workshopIndex, "artist": data["name"] };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            alert("Workshop joined.");
            location.reload();
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("Must be logged in before joining a workshop.");
        } else if (this.readyState == 4 && this.status == 403) {//once the response comes back successful
            alert("Cannot join your own workshop.");
        }
    }
    xhttp.open("PUT", `http://localhost:3000/workshops/`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(workshop));
}