const profileButton = document.getElementById("profileButton");
profileButton.onclick = function () {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            window.location.href = `http://localhost:3000/profile`;
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("Must be logged in to view your profile.");
        }
    }
    xhttp.open("GET", `http://localhost:3000/profile`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
};