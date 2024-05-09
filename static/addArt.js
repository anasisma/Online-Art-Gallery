//get the button to create vendors and set its onclick
const submitButton = document.getElementById("submitArt");
submitButton.onclick = function () {
    let nameInput = document.getElementById("nameInput").value;
    let yearInput = document.getElementById("yearInput").value;
    let cateInput = document.getElementById("cateInput").value;
    let mediInput = document.getElementById("mediInput").value;
    let descInput = document.getElementById("descInput").value;
    let urlInput = document.getElementById("urlInput").value;
    createArt(nameInput, yearInput, cateInput, mediInput, descInput, urlInput);
};

function createArt(name, year, category, medium, description, url) { //sends new art to the server
    if (name && year && category && medium && description && url) { //check if all needed info is not blank
        //create vendor object with data from arguments
        let art = {};
        art["name"] = name;
        art["year"] = year;
        art["category"] = category;
        art["medium"] = medium;
        art["description"] = description;
        art["url"] = url;

        //send object to server
        let xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
                window.location.href = `http://localhost:3000/gallery/${name}`;
            } else if (this.readyState == 4 && this.status == 403) {
                alert("There is already an artwork with this name.")
            }
        }
        xhttp.open("POST", "http://localhost:3000/addArt", true);
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(art));
    } else {
        alert("Please fill in all the info to create a new vendor.")
    }
}