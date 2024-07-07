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
    signUpIfNewUser(userId);
    let token = setToken(req, res, userId);
    res.send(JSON.stringify({ "msg": 'logged in user ' + userId, "userId": userId, "loggedIn": userId == undefined ? false : true, "token": token }));
});

app.get('/checkLogin', (req, res) => {
    let userId = setToken(req, res);
    res.send(JSON.stringify({ "msg": 'logged in user ' + userId, "userId": userId, "loggedIn": userId == undefined ? false : true }));
});

app.get('/searchUser', (req, res) => {
    let userId = setToken(req, res);
    const userIdToSearch = req.query.userIdToSearch;
    let obj = {};
    let userSearched = userData[userIdToSearch];
    let user = userData[userId];
    if(userIdToSearch==userId) {
        obj["error"] = `You can't send friend request to yourself.`;
    } else if(userSearched) {
        obj["userId"] = userSearched.id;
        obj["friends"] = userSearched.friends?userSearched.friends.length:0;
        obj["totalPosts"] = userSearched.posts?userSearched.posts.length:0;
        obj["mutualFriends"] = [];
        if(userSearched.friends.indexOf(userId)>-1) {
            obj["buttonLabel"] = "You two are already friends";
        } else if(userSearched.friendRequests.indexOf(userId)>-1) {
            obj["buttonLabel"] = "Friend Request Already Sent";
        } else if(user.friendRequests.indexOf(userIdToSearch)>-1) {
            obj["buttonLabel"] = "You already have a friend request from "+userIdToSearch;
        } else {
            obj["buttonLabel"] = "Send Friend Request";
        }
        if(userSearched.friends && userSearched.friends.length>0 && user.friends && user.friends.length>0) {
            for(let friendIndx in user.friends) {
                let friendId = user.friends[friendIndx];
                if(userSearched.friends.indexOf(friendId)>-1) {
                    obj["mutualFriends"].push(friendId);
                }
            }
        }
    } else {
        obj["error"] = `User ${userIdToSearch} not found.`;
    }
    res.send(JSON.stringify(obj));
});

app.get('/getUserData', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    let obj = {"friendRequests":[],"notifications":[],"friends":[]};
    if(user) {
        obj["friendRequests"] = user.friendRequests;
        obj["notifications"] = user.notifications;
        obj["friends"] = user.friends; 
    }
    res.send(JSON.stringify(obj));
});

app.get('/sendFriendRequest', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let resp = {};
    let friend = userData[friendId];
    if(user && friend && friendId!=userId) {
        if(!friend.friendRequests) {
            friend.friendRequests = [];
        }
        if(!user.friendRequests && user.friendRequests.indexOf(friendId)>-1) {
            resp = {"message":"You already have a friend request from "+friendId};
        } else if(friend.friendRequests.indexOf(userId)==-1) {
            friend.friendRequests.push(userId);
            friend.notifications.push("You have one friend request from @"+userId);
            resp = {"message":"Friend Request Sent"};
        } else {
            resp = {"message":"Friend Request Already Sent Before"};
        }
    } else {
        resp = {"message":"Invalid Session"};
    }
    res.send(JSON.stringify(resp));
});

app.get('/acceptFriendRequest', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let friend = userData[friendId];
    let resp = {};
    if(user && friend) {
        if(!user.friendRequests || user.friendRequests.indexOf(friendId)==-1) {
            resp = {"message":"Invalid State. There is no such friend request"};
        } else {
            if(!user.friends) {
                user.friends = [];
            }
            if(!friend.friends) {
                friend.friends = [];
            }
            user.friendRequests.splice(user.friendRequests.indexOf(friendId),1);//remove friend request
            //make both friends of each other
            user.friends.push(friendId);
            friend.friends.push(userId);
            friend.notifications.push(`@${userId} accepted your friend request.`);
            resp = {"message":"Friend Request Accepted","friendRequests":user.friendRequests,"friends":user.friends};
        }
    } else {
        resp = {"message":"Invalid Session"};
    }
    res.send(JSON.stringify(resp));
});

app.get('/rejectFriendRequest', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let resp = {};
    if(user) {
        if(!user.friendRequests || user.friendRequests.indexOf(friendId)==-1) {
            resp = {"message":"Invalid State. There is no such friend request"};
        } else {
            user.friendRequests.splice(user.friendRequests.indexOf(friendId),1);//remove friend request
            resp = {"message":"Friend Request Rejected","friendRequests":user.friendRequests};
        }
    } else {
        resp = {"message":"Invalid Session"};
    }
    res.send(JSON.stringify(resp));
});

app.get('/removeFriend', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    let resp = {};
    if(user) {

    } else {
        resp = {"message":"Invalid Session"};
    }
    res.send(JSON.stringify(resp));
});

app.get('/deleteNotification', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    let resp = {};
    if(user) {

    } else {
        resp = {"message":"Invalid Session"};
    }
    res.send(JSON.stringify(resp));
});

app.get('/getAllPosts', (req, res) => {
    let userId = setToken(req, res);
    let postId = req.query.postId;
    if (!userData[userId]) {
        res.send("[]");
    } else {
        let posts = userData[userId]["posts"];
        if(userData[userId]["friends"] && userData[userId]["friends"].length>0) {
            for(let fIndx in userData[userId]["friends"]) {
                let friendId = userData[userId]["friends"][fIndx];
                let friend = userData[friendId];
                if(friend && friend["posts"] && friend["posts"].length>0) {
                    posts = [...posts,...friend["posts"]];
                }
            }
        }
        res.send(JSON.stringify(posts));
    }
});

app.get('/getPost', (req, res) => {
    let userId = setToken(req, res);
    let postId = req.query.postId;
    let post = posts[postId];
    if(userData[userId] && post) {
        let isSelfPost = (userData[userId]["posts"].indexOf(postId) > -1 && post.userId==userId);
        let isFriendsPost = (userData[userId]["friends"] && userData[userId]["friends"].indexOf(post.userId)>-1);
        if (isSelfPost || isFriendsPost) {
            let image = post.image;
            let likes = JSON.stringify(post["likes"] ? post["likes"] : []);
            if (image != null && image.indexOf("http") != 0) {
                fs.readFile("uploads/" + image, (err, data) => {
                    if (err) {
                        res.status(500).send('Error reading the image file');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        let imgData = { "postId":postId,"userId":post.userId,"imgData": data ,'caption': post.caption, 'date': post.date, 'likes': likes, 'comments': JSON.stringify(post.comments) };
                        res.end(JSON.stringify(imgData));
                    }
                });
            } else {
                let captionObj = {};
                if (image != null && image.indexOf("http") == 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    captionObj = {"postId":postId,"userId":post.userId,"caption": post.caption , 'imageUrl': image, 'date': post.date, 'likes': likes, 'comments': JSON.stringify(post.comments)};
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    captionObj = {"postId":postId,"userId":post.userId,"caption": post.caption, 'date': post.date, 'likes': likes, 'comments': JSON.stringify(post.comments) };
                }
                res.end(JSON.stringify(captionObj));
            }
        } else {
            res.end('{}');
        }
    } else {
        res.end('{}');
    }
});

app.listen(port, () => {
    console.log(`App is listening at http://localhost:${port}`);
});

//functions

function signUpIfNewUser(userId) {
    if (!userData[userId]) {
        userData[userId] = { "id": userId, "friendRequests": [], "friends": [], "posts": [], "friendsPosts": [], "notifications": [] };
    }
}

function setToken(req, res, userId) {
    if (userId) {
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