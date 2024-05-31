let http = require("http");
let fs = require("fs");
const PORT = 9090;
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

let server = http.createServer((req, res) => {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
        console.log("new cookie set");
        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 100);
        const cookie = `tok=${generateUUID()}; Expires=${expires.toUTCString()}; HttpOnly`;
        res.setHeader('Set-Cookie', cookie);
    }
    if (req.url == "/" || req.url == "/login") {
        fs.readFile("login.html", (err, data) => {
            let html = String(data);
            res.end(html);
        });
    } else if (req.url == "/syncData") {
        syncDataLocally();
        res.end("data synched");
    } else if (req.url.indexOf("/login?id=") == 0) {
        let userId = req.url.replace("/login?id=", "");
        fs.readFile("index.html", (err, data) => {
            let html = String(data);
            if (userData[userId] == undefined) {//signup
                console.log("NEW USER signup @" + userId);
                userData[userId] = { "id": userId, "friendRequests": [], "friends": [], "posts": [], "friendsPosts": [], "notifications": [] };
            } else {
                console.log("EXISTING USER loggedIn @" + userId + " has " + userData[userId]["friends"].length + " friends.");
                userData[userId]["friendsPosts"] = [];
                for (let f = 0; f < userData[userId]["friends"].length; f++) {
                    let friendId = userData[userId]["friends"][f];
                    let friendData = userData[friendId];
                    for (let p = 0; p < friendData["posts"].length; p++) {
                        let postId = friendData["posts"][p];
                        userData[userId]["friendsPosts"].push({ "friendId": friendId, "postId": postId });
                        if (p > 3) {//at most 3 posts from a friend in timeline
                            break;
                        }
                    }
                }
            }
            let subUserData = {
                "id": userId,
                "friendRequests": userData[userId].friendRequests,
                "friends": userData[userId].friends,
                "posts": userData[userId].posts,
                "friendsPosts": userData[userId].friendsPosts,
                "notifications": userData[userId].notifications
            };
            html = html.replace("__PLACEHOLDER__", JSON.stringify(subUserData));
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
        if (queryString.length != 2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            if (userData[friendId] == undefined) {
                res.end(friendId + " Not found");
            } else {
                if (friendId == userId) {
                    res.end("You can't send friend request to yourself");
                } else if (userData[userId]["friends"].indexOf(friendId) > -1) {
                    res.end(friendId + " Found and is already your friend");
                } else if (userData[friendId]["friendRequests"].indexOf(userId) > -1) {
                    res.end("You have alread sent friend request to " + friendId);
                } else if (userData[userId]["friendRequests"].indexOf(friendId) > -1) {
                    res.end("You have already have a frnd req from " + friendId);
                } else {
                    res.end(friendId + " Found. Send Friend Request");
                }
            }
        }
    } else if (req.url.indexOf("/sendFriendReq?friendId=") == 0) {
        let queryString = req.url.replace("/sendFriendReq?friendId=", "").split("___");
        if (queryString.length != 2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            if (friendId == userId) {
                res.end("You can't send friend request to yourself");
            } else if (userData[friendId] == undefined) {
                res.end(friendId + " Not found");
            } else {
                if (userData[userId]["friends"].indexOf(friendId) > -1) {
                    res.end(friendId + " Found and is already your friend");
                } else if (userData[friendId]["friendRequests"].indexOf(userId) > -1) {
                    res.end("You have alread sent friend request to " + friendId);
                } else {
                    userData[friendId]["friendRequests"].push(userId);
                    userData[friendId]["notifications"].push("You have one friend request from @" + userId);
                    res.end("Frend Request sent to " + friendId);
                }
            }
        }
    } else if (req.url.indexOf("/acceptFriendReq?friendId=") == 0) {
        let queryString = req.url.replace("/acceptFriendReq?friendId=", "").split("___");
        if (queryString.length != 2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            if (userData[userId]["friends"].indexOf(friendId) == -1) {
                let lenB4 = userData[userId]["friends"].length;
                //add to each other's friend list
                userData[userId]["friends"].push(friendId);
                userData[friendId]["friends"].push(userId);
                userData[friendId]["notifications"].push("@" + userId + " accepted your friend request.");
                let lenAfter = userData[userId]["friends"].length;
                console.log("@" + userId + " ACCEPTED friend request of @" + friendId + " total number of friends changed from " + lenB4 + " to " + lenAfter);
            }
            userData[userId]["friendRequests"].splice(userData[userId]["friendRequests"].indexOf(friendId), 1);
            res.end(JSON.stringify({ "friendRequests": userData[userId]["friendRequests"], "friends": userData[userId]["friends"] }));
        }
    } else if (req.url.indexOf("/rejectFriendReq?friendId=") == 0) {
        let queryString = req.url.replace("/rejectFriendReq?friendId=", "").split("___");
        if (queryString.length != 2) {
            res.end("Not found");
        } else {
            let friendId = queryString[0];
            let userId = queryString[1];
            console.log("@" + userId + " REJECTED friend request of @" + friendId);
            userData[userId]["friendRequests"].splice(userData[userId]["friendRequests"].indexOf(friendId), 1);
            res.end(JSON.stringify(userData[userId]["friendRequests"]));
        }
    } else if (req.url.indexOf("/getPost?postDetails=") == 0) {
        let postDetails = req.url.replace("/getPost?postDetails=", "");
        postDetails = postDetails.split("___");
        if (postDetails.length == 3) {
            let userId = postDetails[0];
            let friendId = postDetails[1];
            let postId = postDetails[2];
            if (!userData[userId]) {
                res.end("{}");
            } else {
                let post = posts[postId];
                if (!post) {
                    res.end("{}");
                } else {
                    let image = null;
                    if (post.visibility == EVERYONE) {
                        image = post.image;
                    }
                    let likes = JSON.stringify(post["likes"] ? post["likes"] : []);
                    if (image != null) {
                        fs.readFile("uploads/" + image, (err, data) => {
                            if (err) {
                                res.status(500).send('Error reading the image file');
                            } else {
                                res.writeHead(200, { 'Content-Type': 'image/jpeg', 'caption': post.caption, 'date': post.date, 'likes': likes });
                                res.end(data);
                            }
                        });
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/plain', 'date': post.date, 'likes': likes });
                        res.end(post.caption);
                    }
                }
            }
        } else {
            res.end("{}");
        }
    } else if (req.url.indexOf("/likePost?postDetails=") == 0) {
        let postDetails = req.url.replace("/likePost?postDetails=", "");
        postDetails = postDetails.split("___");
        if (postDetails.length == 2) {
            let userId = postDetails[1];
            //let friendId = postDetails[1];//retrieve it from post id
            let postId = postDetails[0];
            if (!userData[userId]) {
                res.end("[]");
            } else {
                let post = posts[postId];
                let postAuthor = userData[post.userId];
                if (!post) {
                    res.end("[]");
                } else {
                    let notification = null;
                    if (post.visibility == EVERYONE) {
                        if (!post["likes"]) {
                            post["likes"] = [];
                        }
                        if (post["likes"].indexOf(userId) == -1) {
                            post["likes"].push(userId);//like
                            notification = "post " + postId + " liked by " + userId;
                            console.log(userId + " liked post of " + post.userId);
                        } else {
                            post["likes"].splice(post["likes"].indexOf(userId), 1);//unlike
                            notification = "post " + postId + " un-liked by " + userId;
                            console.log(userId + " un-liked post of " + post.userId);
                        }
                        if (notification != null && postAuthor && post.userId != userId) {
                            if (postAuthor["notifications"].indexOf(notification) > -1) {
                                postAuthor["notifications"].splice(postAuthor["notifications"].indexOf(notification), 1);
                            }
                            postAuthor["notifications"].push(notification);
                        }
                        res.end(JSON.stringify(post["likes"]));
                    }
                }
            }
        } else {
            res.end("[]");
        }
    } else if (req.url.indexOf("/commentOnPost?postDetails=") == 0) {
        let postDetails = req.url.replace("/commentOnPost?postDetails=", "");
        postDetails = postDetails.split("___");
        if (postDetails.length == 3) {
            let userId = postDetails[1];
            //let friendId = postDetails[1];//retrieve it from post id
            let postId = postDetails[0];
            let comment = postDetails[2];
            if (!userData[userId]) {
                res.end("[]");
            } else {
                let post = posts[postId];
                if (!post) {
                    res.end("[]");
                } else {
                    if (post.visibility == EVERYONE) {
                        if (!post["comments"]) {
                            post["comments"] = [];
                        }
                        post["comments"].push({ "user": userId, "comment": comment });
                        res.end(JSON.stringify(post["comments"]));
                    }
                }
            }
        } else {
            res.end("[]");
        }
    } else if (req.method === 'POST' && req.url === '/postStatus') {
        const boundary = req.headers['content-type'].split('; ')[1].replace('boundary=', '');
        let body = '';
        req.setEncoding('binary');

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            const parts = body.split(`--${boundary}`);
            parts.pop(); // Remove the last part
            parts.shift(); // Remove the first part
            let fileName = null;
            let caption = null;
            let userId = null;
            parts.forEach(part => {
                const [headers, rawBody] = part.split('\r\n\r\n');
                if (headers && rawBody) {
                    const dispositionMatch = headers.match(/Content-Disposition: form-data; name="([^"]+)"; filename="([^"]+)"/);
                    const dispositionMatch2 = headers.match(/Content-Disposition: form-data; name="caption"/);
                    const dispositionMatch3 = headers.match(/Content-Disposition: form-data; name="userId"/);
                    if (dispositionMatch) {
                        fileName = dispositionMatch[2].split(".");
                        fileName = generateUUID() + "." + fileName[fileName.length - 1];
                        const content = rawBody.slice(0, rawBody.lastIndexOf('\r\n'));
                        const buffer = Buffer.from(content, 'binary');

                        fs.writeFile(`uploads/${fileName}`, buffer, err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Server Error');
                                return;
                            }
                        });
                    } else if (dispositionMatch2) {
                        const name = dispositionMatch2[0];
                        if (name.indexOf("name=\"caption\"") > -1) {
                            caption = rawBody.trim();
                        }
                    } else if (dispositionMatch3) {
                        const name = dispositionMatch3[0];
                        if (name.indexOf("name=\"userId\"") > -1) {
                            userId = rawBody.trim();
                        }
                    }
                }
            });
            let postId = generateUUID2();
            let post = { "id": postId, "image": fileName, "caption": caption, "visibility": EVERYONE, "userId": userId, "date": (new Date()), "likes": [], "comments": [] };
            userData[userId]["posts"].push(postId);
            posts[postId] = post;
            console.log("status update", post);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('success');
        });
    } else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('400 Bad Request');
    }
});

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

server.listen(PORT, () => {
    console.log(`listening on PORT ${PORT}`);
});

