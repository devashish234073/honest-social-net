const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const cookies = [];
let userData = {};
let userDataHash = null;
let posts = {};
let postsHash = null;
const EVERYONE = "everyone";
const PRIVATE = "private";
const ONLYFRIENDS = "onlyfriends";

function populateData() {
    try {
        let stringifiedUSerData = fs.readFileSync("data/users.json");
        userData = JSON.parse(stringifiedUSerData);
        hashObject(stringifiedUSerData).then(hash => {
            userDataHash = hash;
        });
        let stringifiedPostData = fs.readFileSync("data/posts.json");
        posts = JSON.parse(stringifiedPostData);
        hashObject(stringifiedPostData).then(hash => {
            postsHash = hash;
        });
    } catch (e) {
        console.error("Unable to populate data from local", e);
    }
    if (Object.keys(userData).length === 0) {
        console.log("no data found locally. Populating default users");
        userData["user123"] = { "id": "user123", "friendRequests": [], "friends": ["user124", "user125", "user126", "user127"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user124"] = { "id": "user124", "friendRequests": [], "friends": ["user123", "user125"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user125"] = { "id": "user125", "friendRequests": [], "friends": ["user123", "user124"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user126"] = { "id": "user126", "friendRequests": [], "friends": ["user123", "user127"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user127"] = { "id": "user127", "friendRequests": [], "friends": ["user123", "user126"], "posts": [], "friendsPosts": [], "notifications": [] };
    } else {
        console.log("data restored from local");
    }
}

populateData();

const corsOptions = {
    origin: 'http://localhost:4200',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/login/:userId', (req, res) => {
    const userId = req.params.userId;
    setCookie(req, res, userId);
    res.send(JSON.stringify({"msg":'logged in user '+userId,"userId":userId,"loggedIn":userId==undefined?false:true}));
});

app.get('/checkLogin', (req, res) => {
    let userId = setCookie(req, res);
    res.send(JSON.stringify({"msg":'logged in user '+userId,"userId":userId,"loggedIn":userId==undefined?false:true}));
});

app.get('/contact', (req, res) => {
    setCookie(req, res);
    res.send('Contact Page');
});

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});

//functions
function setCookie(req, res, userId) {
    let cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        console.log("new cookie set",cookies);
        //const expires = new Date();
        //expires.setFullYear(expires.getFullYear() + 100);
        const expires = new Date(Date.now() + 5 * 60 * 1000);
        cookieHeader = `tok=${generateUUID()}; Expires=${expires.toUTCString()}; HttpOnly`;
        res.setHeader('Set-Cookie', cookieHeader);
    }
    if(userId) {
        cookies[cookieHeader] = userId;
    }
    return cookies[cookieHeader];
}

function generateUUID2() {
    return 'xxxxxxxx-x3xx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}