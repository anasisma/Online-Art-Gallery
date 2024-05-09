const logoutButton = document.getElementById("logoutButton");
logoutButton.onclick = function () {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            alert("Logged out successfully.");
            window.location.href = "http://localhost:3000/";
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("Must be logged in before logging out.");
        }
    }
    xhttp.open("PUT", `http://localhost:3000/logout`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
};