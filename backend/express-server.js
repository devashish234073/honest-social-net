const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require("fs");
const app = express();
const port = 3000;
const tokens = [];
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

async function hashObject(jsonString) {
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

function syncDataLocally() {
    let stringifiedUSerData = JSON.stringify(userData);
    hashObject(stringifiedUSerData).then(hash => {
        if (userDataHash == null || userDataHash != hash) {
            fs.writeFileSync("data/users.json", stringifiedUSerData);
            console.log("users synched locally at " + (new Date()));
            userDataHash = hash;
        } else {
            console.log("users sync cancelled. As no change is done");
        }
    });
    let stringifiedPostData = JSON.stringify(posts);
    hashObject(stringifiedPostData).then(hash => {
        if (postsHash == null || postsHash != hash) {
            fs.writeFileSync("data/posts.json", stringifiedPostData);
            console.log("posts synched locally at " + (new Date()));
            postsHash = hash;
        } else {
            console.log("posts sync cancelled. As no change is done");
        }
    });
}

setInterval(function () {
    syncDataLocally();
}, 60000);

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
    let token  = setToken(req, res, userId);
    res.send(JSON.stringify({"msg":'logged in user '+userId,"userId":userId,"loggedIn":userId==undefined?false:true,"token":token}));
});

app.get('/checkLogin', (req, res) => {
    let userId = setToken(req, res);
    res.send(JSON.stringify({"msg":'logged in user '+userId,"userId":userId,"loggedIn":userId==undefined?false:true}));
});

app.get('/getAllPosts', (req, res) => {
    let userId = setToken(req, res);
    let postId = req.query.postId;
    let posts = userData[userId]["posts"];
    res.send(JSON.stringify(posts));
});

app.get('/getPost', (req, res) => {
    let userId = setToken(req, res);
    let postId = req.query.postId;
    res.send('Contact Page');
});

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});

//functions
function setToken(req, res, userId) {
    if(userId) {
        let tok = generateUUID();
        tokens[tok] = userId;
        return tok;
    } else {
        let tok = req.headers["token"];
        return tokens[tok];
    }
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