//load fs module then get the gallery from its file
const fs = require('fs');
let rawData = fs.readFileSync("gallery.json");
let gallery = JSON.parse(rawData);

let artists = {};

//default page size is 5
const pageSize = 5;

let artCount = 0;

let workshopCount = 0;

Object.keys(gallery).forEach(elem => {
    artCount++;
    artists[gallery[elem]["artist"]] = {
        "name": gallery[elem]["artist"], "works": [], "workshops": {}
    };
    artists[gallery[elem]["artist"]]["workshops"][workshopCount] = { "name": `Workshop ${workshopCount}`, "participants": [] };
    workshopCount++;
});

Object.keys(gallery).forEach(elem => {
    artists[gallery[elem]["artist"]]["works"].push(elem);
});

let users = {};
let userCount = 0;

let sessions = {};

let reviews = {};
for (let i in gallery) {
    reviews[i] = {};
    reviews[i]["reviews"] = {};
    reviews[i]["likeCount"] = 0;
}
let reviewCount = 0;

//load express module
const express = require('express');
let app = express();

//load session module
const session = require('express-session');
app.use(session({
    secret: 'some secret key here',
    resave: true,
    saveUninitialized: true
}));

//set the attributes for view
app.set("view engine", "pug");
app.set("views", "views");

app.use(express.static("static")); //access static folder in order to serve static files

app.use(express.json()); //used for parsing and such

//middleware function to check if user is logged in
function authLoggedIn(req, res, next) {
    //if user is logged in, move to next middleware
    //if not, send them to login
    if (sessions.hasOwnProperty(req.sessionID)) {
        next();
    } else {
        res.status(401).send("Must be logged in.");
    }
}

//middleware function to check if user is logged in, so that you can't log in again
function authSendToProfile(req, res, next) {
    //if user is not logged in, move to next middleware
    //if they are, send them to their profile page
    if (sessions.hasOwnProperty(req.sessionID)) {
        res.redirect("/profile");
    } else {
        next();
    }
}

//middleware function to check if user is an artist
function authIsArtist(req, res, next) {
    //if user is not logged in, move to next middleware
    //if they are, send them to their profile page
    if (sessions.hasOwnProperty(req.sessionID)) {
        if (users[sessions[req.sessionID]["username"]]["type"] == "Artist") {
            next();
        } else {
            res.status(403).send("Must be an artist to access this.")
        }
    } else {
        res.status(401).send("Must be logged in.");
    }
}

//implementing the middlewares for specific routes
app.use('/profile', authLoggedIn);
app.use('/logout', authLoggedIn);
app.use('/like', authLoggedIn);
app.use('/review', authLoggedIn);
app.use('/workshops', authLoggedIn);
app.use('/addWorkshop', authIsArtist);
app.use('/addArt', authIsArtist);
app.use('/login', authSendToProfile);

app.get("/", (req, res) => { //when the url is /, load the home page's pug
    res.redirect("/gallery");
});

app.get('/login', (req, res) => {
    // Show the login page
    res.render("login");
});

app.get("/users", (req, res) => {
    let page;
    if (req.query.page) {
        page = req.query.page;
    } else {
        page = 1;
    }

    const offset = (page - 1) * pageSize;

    let userItems = Object.values(users);
    userItems = userItems.slice(offset, offset + pageSize);

    res.format({ //depending on the accept header of the request
        html: function () { //if request wants html, load html page showing the gallery
            res.render("users", { "users": userItems, "page": page, "userCount": userCount, "size": pageSize });
        },
        json: function () {
            //if request wants JSON, send an array of the artwork names
            let array = [];
            for (let i in users) {
                array.push(i.name);
            }
            res.json({ "users": array });
        }
    });
});

app.get('/users/:name', (req, res) => {
    const user = decodeURI(req.params.name); //set the vendorID to the parameter in the url
    const getUser = users.hasOwnProperty(user); //check if the vendor with id parameter exists
    if (!getUser) {
        res.status(404).send("User not found.")
    } else {
        res.format({ //depending on the accept header of the request
            html: function () { //if request wants html, load html page showing the gallery
                res.render("user", { "user": users[user] });
            },
            json: function () {
                //if request wants JSON, send an array of the artwork names
                res.json({ "user": users[user] });
            }
        });
    }
});

app.get('/profile', (req, res) => {
    res.format({ //depending on the accept header of the request
        html: function () { //if request wants html, load html page showing the gallery
            res.render("profile", { "user": users[sessions[req.sessionID]["username"]] });
        },
        json: function () {
            //if request wants JSON, send an array of the artwork names
            res.json({ "user": users[sessions[req.sessionID]["username"]] });
        }
    });
});

app.put('/profile', (req, res) => {
    if (req.body["name"]) { //if the request body has a name attribute
        users[sessions[req.sessionID]["username"]]["username"] = req.body["name"];  //update name to new one
    } if (req.body["password"]) { //if the request body has a password attribute
        users[sessions[req.sessionID]["username"]]["password"] = req.body["password"]; //update password to new one
    } if (req.body["type"]) { //if the request body has a type attribute
        if (req.body["type"] == "Artist") {
            if (!artists.hasOwnProperty(users[sessions[req.sessionID]["username"]]["username"])) {
                artists[users[sessions[req.sessionID]["username"]]["username"]] = {};
                artists[users[sessions[req.sessionID]["username"]]["username"]]["name"] = users[sessions[req.sessionID]["username"]]["username"];
                artists[users[sessions[req.sessionID]["username"]]["username"]]["works"] = [];
                artists[users[sessions[req.sessionID]["username"]]["username"]]["workshops"] = {};
            }
        }
        users[sessions[req.sessionID]["username"]]["type"] = req.body["type"]; //update type to new one
    }

    if (req.body["name"]) {
        users[req.body["name"]] = users[sessions[req.sessionID]["username"]];
        delete users[sessions[req.sessionID]["username"]];
        sessions[req.sessionID]["username"] = req.body["name"];
    }

    res.sendStatus(200);
});

app.get("/gallery", (req, res) => {
    let page;
    if (req.query.page) {
        page = req.query.page;
    } else {
        page = 1;
    }

    const offset = (page - 1) * pageSize;

    let galleryItems = Object.values(gallery);
    galleryItems = galleryItems.slice(offset, offset + pageSize);

    res.format({ //depending on the accept header of the request
        html: function () { //if request wants html, load html page showing the gallery
            res.render("gallery", { "gallery": galleryItems, "page": page, "artCount": artCount, "size": pageSize });
        },
        json: function () {
            //if request wants JSON, send an array of the artwork names
            let array = [];
            for (let i in gallery) {
                array.push(i.name);
            }
            res.json({ "gallery": array });
        }
    });
});

app.get("/artists", (req, res) => {
    let page;
    if (req.query.page) {
        page = req.query.page;
    } else {
        page = 1;
    }

    const offset = (page - 1) * pageSize;

    let artistCount = Object.keys(artists).length;

    let artistItems = Object.values(artists);
    artistItems = artistItems.slice(offset, offset + pageSize);

    res.format({ //depending on the accept header of the request
        html: function () { //if request wants html, load html page showing the gallery
            res.render("artists", { "artists": artistItems, "page": page, "artCount": artistCount, "size": pageSize });
        },
        json: function () {
            //if request wants JSON, send an array of the artwork names
            let array = [];
            for (let i in artists) {
                array.push(i.name);
            }
            res.json({ "artists": array });
        }
    });
});

app.get('/artists/:artist', (req, res) => {
    const artist = decodeURI(req.params.artist); //set the vendorID to the parameter in the url
    const getArtist = artists.hasOwnProperty(artist); //check if the vendor with id parameter exists
    if (!getArtist) { //if it doesn't, send 404 response
        res.status(404).send('Artist not found.');
    } else {
        res.format({ //depending on the accept header of the request
            html: function () { //if request wants html, load html page showing the vendor and its data
                res.render("artist", { "artist": artists[artist] });
            },
            json: function () { //if request wants JSON, send the vendor as an object
                res.json(artists[artist]);
            }
        });
    }
});

app.put('/artists/:artist', (req, res) => {
    if (sessions.hasOwnProperty(req.sessionID)) {
        const artist = decodeURI(req.params.artist);
        const getArtist = artists.hasOwnProperty(artist); //check if the vendor with id parameter exists
        if (!getArtist) { //if it doesn't, send 404 response
            res.status(404).send('Artist not found.');
        } else {
            if (artist == users[sessions[req.sessionID]["username"]]["username"]) {
                res.status(403).send("Cannot follow yourself.");
            } else {
                if (users[sessions[req.sessionID]["username"]]["followedArtists"].hasOwnProperty(artist)) {
                    delete users[sessions[req.sessionID]["username"]]["followedArtists"][artist];
                } else {
                    users[sessions[req.sessionID]["username"]]["followedArtists"][artist] = artists[artist]["name"];
                }
                res.sendStatus(200);
            }
        }
    } else {
        res.sendStatus(401);
    }
});

app.get('/gallery/:artName', (req, res) => {
    const artName = decodeURI(req.params.artName); //set the vendorID to the parameter in the url
    const getArt = gallery.hasOwnProperty(artName); //check if the vendor with id parameter exists
    if (!getArt) { //if it doesn't, send 404 response
        res.status(404).send('Artwork not found.');
    } else {
        res.format({ //depending on the accept header of the request
            html: function () { //if request wants html, load html page showing the vendor and its data
                res.render("artwork", { "art": gallery[artName], "reviews": reviews });
            },
            json: function () { //if request wants JSON, send the vendor as an object
                res.json(gallery[artName]);
            }
        });
    }
});

app.put('/like/:art', (req, res) => {
    const artName = decodeURI(req.params.art);
    const getArt = gallery.hasOwnProperty(artName);
    if (!getArt) { //if it doesn't, send 404 response
        res.status(404).send('Artwork not found.');
    } else {
        if (gallery[artName]["artist"] == users[sessions[req.sessionID]["username"]]["username"]) {
            res.status(403).send("Cannot follow yourself.");
        } else {
            if (users[sessions[req.sessionID]["username"]]["likedArt"].hasOwnProperty(artName)) {
                delete users[sessions[req.sessionID]["username"]]["likedArt"][artName];
                reviews[artName]["likeCount"]--;
            } else {
                users[sessions[req.sessionID]["username"]]["likedArt"][artName] = gallery[artName];
                reviews[artName]["likeCount"]++;
            }
            res.sendStatus(200);
        }
    }
});

app.put('/review/:art', (req, res) => {
    const artName = decodeURI(req.params.art);
    const getArt = gallery.hasOwnProperty(artName);
    if (!getArt) { //if it doesn't, send 404 response
        res.status(404).send('Artwork not found.');
    } else {
        if (gallery[artName]["artist"] == users[sessions[req.sessionID]["username"]]["username"]) {
            res.status(403).send("Cannot review your own artwork.");
        } else {
            let review = req.body["review"];
            reviews[artName]["reviews"][reviewCount] = {};
            reviews[artName]["reviews"][reviewCount]["reviewer"] = sessions[req.sessionID]["username"];
            reviews[artName]["reviews"][reviewCount]["review"] = review;
            users[sessions[req.sessionID]["username"]]["reviews"][reviewCount] = reviews[artName]["reviews"][reviewCount];
            users[sessions[req.sessionID]["username"]]["reviews"][reviewCount]["artwork"] = artName;
            reviewCount++;
            res.sendStatus(200);
        }
    }
});

app.delete('/review/', (req, res) => {
    const reviewID = req.body["reviewID"];
    const artName = req.body["artName"];
    const getReview = users[sessions[req.sessionID]["username"]]["reviews"].hasOwnProperty(reviewID);
    if (!getReview) { //if it doesn't, send 404 response
        if (reviews[artName]["reviews"].hasOwnProperty[reviewID]) {
            res.status(403).send("Cannot remove another user's review.");
        } else {
            res.status(404).send('Review not found.');
        }
    } else {
        delete users[sessions[req.sessionID]["username"]]["reviews"][reviewID];

        delete reviews[artName]["reviews"][reviewID];

        res.sendStatus(200);
    }
});

app.get('/workshop/:artist/:ID', (req, res) => {
    const artist = decodeURI(req.params.artist);
    const getArtist = artists.hasOwnProperty(artist);
    if (!getArtist) {
        res.status(404).send("Artist not found.");
    } else {
        const workshopID = decodeURI(req.params.ID);
        const getWorkshop = artists[artist]["workshops"].hasOwnProperty(workshopID);
        if (!getWorkshop) {
            res.status(404).send('Workshop not found.');
        } else {
            res.format({ //depending on the accept header of the request
                html: function () { //if request wants html, load html page showing the gallery
                    res.render('workshop', { "workshop": artists[artist]["workshops"][workshopID] });
                },
                json: function () {
                    //if request wants JSON, send an array of the artwork names
                    res.json({ "workshop": artists[artist]["workshops"][workshopID] });
                }
            });
        }
    }
});

app.get('/addWorkshop/', (req, res) => {
    res.render('addWorkshop');
});

app.post('/addWorkshop/', (req, res) => {
    artists[sessions[req.sessionID]["username"]]["workshops"][workshopCount] = { "name": req.body["name"], "participants": [] };
    res.status(200);
    res.json({ "artist": sessions[req.sessionID]["username"], "id": workshopCount });
});

app.put('/workshops/', (req, res) => {
    const getArtist = artists.hasOwnProperty(req.body["artist"]);
    if (!getArtist) { //if it doesn't, send 404 response
        res.status(404).send('Artist not found.');
    } else {
        const getWorkshop = artists[req.body["artist"]]["workshops"].hasOwnProperty(req.body["workshopID"]);
        if (!getWorkshop) {
            res.status(404).send('Workshop not found.');
        } else {
            if (artists[req.body["artist"]]["name"] == users[sessions[req.sessionID]["username"]]["username"]) {
                res.status(403).send("Cannot enroll in your own workshop.");
            } else {
                artists[req.body["artist"]]["workshops"][req.body["workshopID"]]["participants"].forEach(element => {
                    if (element == users[sessions[req.sessionID]["username"]]) {
                        res.sendStatus(200);
                        return;
                    }
                });
                artists[req.body["artist"]]["workshops"][req.body["workshopID"]]["participants"].push(users[sessions[req.sessionID]["username"]]);
                res.sendStatus(200);
            }
        }
    }
});

app.get('/addArt', (req, res) => {
    res.render('addArt');
});

app.post('/addArt', (req, res) => {
    const artName = decodeURI(req.body["name"]);
    const getArt = gallery.hasOwnProperty(artName);
    if (getArt) {
        res.status(403).send("Artwork with this name already exists.");
    } else {
        gallery[req.body["name"]] = {
            "name": req.body["name"],
            "artist": users[sessions[req.sessionID]["username"]]["username"],
            "year": req.body["year"],
            "category": req.body["category"],
            "medium": req.body["medium"],
            "description": req.body["description"],
            "image": req.body["url"]
        };
        reviews[req.body["name"]] = {};
        reviews[req.body["name"]]["reviews"] = {};
        reviews[req.body["name"]]["likeCount"] = 0;

        artists[users[sessions[req.sessionID]["username"]]["username"]]["works"].push(req.body["name"]);

        artCount++;

        res.sendStatus(200);
    }
});

app.put("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const getUser = users.hasOwnProperty(username);

    if (getUser) { //if it doesn't, send 404 error
        res.sendStatus(400);
    } else {
        users[username] = { "id": userCount, "username": username, "password": password, "type": "Patron", "followedArtists": {}, "likedArt": {}, "reviews": {} };
        res.send(users[username]);
        userCount++;
    }
});

app.post('/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Check if the username and password are valid
    if (users.hasOwnProperty(username) && users[username]["password"] == password) {
        // If they are, set a session variable
        sessions[req.sessionID] = { "username": username }
        res.sendStatus(200);
    } else {
        // If the credentials are invalid, send code 403
        res.sendStatus(403);
    }
});

app.put('/logout', (req, res) => {
    delete sessions[req.sessionID];
    res.sendStatus(200);
});

app.listen(3000);
console.log("Server listening at http://localhost:3000");