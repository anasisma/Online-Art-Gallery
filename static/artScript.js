const likeButton = document.getElementById("likeButton");
likeButton.onclick = function () {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            location.reload();
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("Must be logged in before liking.");
        } else if (this.readyState == 4 && this.status == 403) {//once the response comes back successful
            alert("Cannot like your own art.");
        }
    }
    xhttp.open("PUT", `http://localhost:3000/like/${data["name"]}`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
};

const leaveReviewButton = document.getElementById("leaveReviewButton");
leaveReviewButton.onclick = function () {
    startReview();
};

function startReview() {
    let div = document.getElementById("left");
    leaveReviewButton.parentNode.removeChild(leaveReviewButton);
    let area = document.createElement("textarea");
    area.cols = 25;
    area.rows = 4;
    area.placeholder = "Leave a review here"
    div.appendChild(area);

    div.appendChild(document.createElement("br"));
    div.appendChild(document.createElement("br"));

    let makeReview = document.createElement("button");
    let textNode = document.createTextNode("Upload review");
    makeReview.appendChild(textNode);
    makeReview.onclick = function () {
        let review = (area.value).toString();
        sendReview(review);
    }
    div.appendChild(makeReview);
}

function sendReview(review) {
    let revObject = { "review": review };
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {//once the response comes back successful
            location.reload();
        } else if (this.readyState == 4 && this.status == 401) {//once the response comes back successful
            alert("Must be logged in before leaving a review.");
        } else if (this.readyState == 4 && this.status == 403) {//once the response comes back successful
            alert("Cannot review your own work.");
        }
    }
    xhttp.open("PUT", `http://localhost:3000/review/${data["name"]}`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(revObject));
}