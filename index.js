let http = require("http");
let fs = require("fs");
const PORT = 9090;
let userData = {};
let posts = {};

function pushDefaultUsers() {
    if(Object.keys(userData).length === 0) {
        userData["user123"] = { "id": "user123", "friendRequests": [], "friends": ["user124","user125","user126","user127"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user124"] = { "id": "user124", "friendRequests": [], "friends": ["user123","user125"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user125"] = { "id": "user125", "friendRequests": [], "friends": ["user123","user124"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user126"] = { "id": "user126", "friendRequests": [], "friends": ["user123","user127"], "posts": [], "friendsPosts": [], "notifications": [] };
        userData["user127"] = { "id": "user127", "friendRequests": [], "friends": ["user123","user126"], "posts": [], "friendsPosts": [], "notifications": [] };
    }
}

pushDefaultUsers();

let server = http.createServer((req, res) => {
    if (req.url == "/" || req.url == "/login") {
        fs.readFile("login.html", (err, data) => {
            let html = String(data);
            res.end(html);
        });
    } else if (req.url.indexOf("/login?id=") == 0) {
        let userId = req.url.replace("/login?id=", "");
        fs.readFile("index.html", (err, data) => {
            let html = String(data);
            if (userData[userId] == undefined) {//signup
                userData[userId] = { "id": userId, "friendRequests": [], "friends": [], "posts": [], "friendsPosts": [], "notifications": [] };
            } else {
                userData[userId]["friendsPosts"] = [];
                for (let f = 0; f < userData[userId]["friends"].length; f++) {
                    let friendId = userData[userId]["friends"][f];
                    let friendData = userData[friendId];
                    for (let p = 0; p < friendData["posts"].length; p++) {
                        let postId = friendData["posts"][p];
                        userData[userId]["friendsPosts"].push(postId);
                        if (p > 3) {//at most 3 posts from a friend in timeline
                            break;
                        }
                    }
                }
            }
            html = html.replace("__PLACEHOLDER__", JSON.stringify(userData[userId]));
            res.end(html);
        });
    } else if (req.url.indexOf("/getNotifications?userId=") == 0) {
        let userId = req.url.replace("/getNotifications?userId=", "");
        if (!userData[userId]) {
            return "[]";
        } else {
            res.end(JSON.stringify(userData[userId]["notifications"]));
        }
    } else if (req.url.indexOf("/getFriendRequests?userId=") == 0) {
        let userId = req.url.replace("/getFriendRequests?userId=", "");
        if (!userData[userId]) {
            return "[]";
        } else {
            res.end(JSON.stringify(userData[userId]["friendRequests"]));
        }
    } else if (req.url.indexOf("/searchFriend?friendId=") == 0) {
        let queryString = req.url.replace("/searchFriend?friendId=", "").split("___");
        if(queryString.length!=2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            if(userData[friendId]==undefined) {
                res.end(friendId+" Not found");
            } else {
                if(friendId==userId) {
                    res.end("You can't send friend request to yourself");
                } else if(userData[userId]["friends"].indexOf(friendId)>-1) {
                    res.end(friendId+" Found and is already your friend");
                } else if(userData[friendId]["friendRequests"].indexOf(userId)>-1) {
                    res.end("You have alread sent friend request to "+friendId);
                } else {
                    res.end(friendId+" Found. Send Friend Request");
                }
            }
        }
    } else if (req.url.indexOf("/sendFriendReq?friendId=") == 0) {
        let queryString = req.url.replace("/sendFriendReq?friendId=", "").split("___");
        if(queryString.length!=2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            if(friendId==userId) {
                res.end("You can't send friend request to yourself");
            } else if(userData[friendId]==undefined) {
                res.end(friendId+" Not found");
            } else {
                if(userData[userId]["friends"].indexOf(friendId)>-1) {
                    res.end(friendId+" Found and is already your friend");
                } else if(userData[friendId]["friendRequests"].indexOf(userId)>-1) {
                    res.end("You have alread sent friend request to "+friendId);
                } else {
                    userData[friendId]["friendRequests"].push(userId);
                    userData[friendId]["notifications"].push("You have one friend request from @"+userId);
                    res.end("Frend Request sent to "+friendId);
                }
            }
        }
    } else if (req.url.indexOf("/acceptFriendReq?friendId=") == 0) {
        let queryString = req.url.replace("/acceptFriendReq?friendId=", "").split("___");
        if(queryString.length!=2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            if(userData[userId]["friends"].indexOf(friendId)>-1) {
                userData[userId]["friends"].push(friendId);
            }
            userData[friendId]["friendRequests"].splice(userData[userId]["friendRequests"].indexOf(friendId), 1);
            res.end("done");
        }
    } else if (req.url.indexOf("/rejectFriendReq?friendId=") == 0) {
        let queryString = req.url.replace("/rejectFriendReq?friendId=", "").split("___");
        if(queryString.length!=2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            userData[friendId]["friendRequests"].splice(userData[userId]["friendRequests"].indexOf(friendId), 1);
            res.end("done");
        }
    } else if (req.url.indexOf("/getPost?postId=") == 0) {
        let postDetails = req.url.replace("/getPost?postDetails=", "");
        postDetails = postDetails.split("___");
        if (postDetails.length == 3) {
            let userId = postDetails[0];
            let friendId = postDetails[1];
            let postId = postDetails[2];
            if (!userData[userId]) {
                return "{}";
            } else {
                res.end(JSON.stringify(userData[userId]["notifications"]));
            }
        } else {
            return "{}";
        }
    }
});

server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
});

