const express = require('express');
let generateImageFunc = null;
let generateImageFuncError = null;
(async () => {
    try {
        const { generateImage } = await import('./AI/stability-ai.js');
        console.log(generateImage);
        generateImageFunc = generateImage;
    } catch (error) {
        console.error('Error importing AI/stability-ai:', error);
        generateImageFuncError = error;
    }
})();
console.log(generateImageFunc);
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
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

let watsonConfig = null;
let watsonConfigLocal = null;
try {
    watsonConfig = require("./watson-config.json");
} catch (e) {

}
try {
    watsonConfigLocal = require("./watson-config.local.json");
} catch (e) {

}

let ibmConfig = null;
if (!watsonConfigLocal && watsonConfig) {
    ibmConfig = watsonConfig;
} else if (watsonConfigLocal) {
    ibmConfig = watsonConfigLocal;
}
let tokenRenewalTimer = null;
let TOKEN_CHECK_DELAY = 200000;
if (ibmConfig) {
    //console.log(ibmConfig);
    if (!ibmConfig["tokenResp"]) {
        let tokenPromise = generateWatsonXToken();
        console.log("tokenPromise",tokenPromise);
        tokenPromise.then((resp) => {
            //console.log("resp",resp);
            ibmConfig["tokenResp"] = resp;
            fs.writeFileSync("watson-config.local.json", JSON.stringify(ibmConfig, null, 4));
            if (ibmConfig["token"]) {
                sendPromptToWatsonX("write a poem on water", 0).then((promptResp) => {
                    console.log("promptResp",promptResp);
                })
                .catch((error) => {
                    error.text().then(response => {
                        const errorDetails = {
                          status: response.status,
                          statusText: response.statusText,
                          body: response
                        };
                        console.log("error while genetating token ",errorDetails);
                    });
                });
            }
        })
        .catch((error)=>{
            error.text().then(response => {
                const errorDetails = {
                  status: response.status,
                  statusText: response.statusText,
                  body: response
                };
                console.log("error while genetating token ",errorDetails);
            });
        });
    } else {
        regenerateTokenIfExpired(() => {
            sendPromptToWatsonX("write a poem on water", 0).then((promptResp) => {
                console.log("promptResp",promptResp);
            })
            .catch((error) => {
                error.text().then(response => {
                    const errorDetails = {
                      status: response.status,
                      statusText: response.statusText,
                      body: response
                    };
                    console.log("error while genetating token ",errorDetails);
                });
            });
        })();
    }
    tokenRenewalTimer = setInterval(regenerateTokenIfExpired(null), TOKEN_CHECK_DELAY);
}

function regenerateTokenIfExpired(callback) {
    return function () {
        let expiration = ibmConfig["tokenResp"]["expiration"];
        let expiryTime = new Date(expiration * 1000);
        if ((expiryTime - (new Date())) < TOKEN_CHECK_DELAY) {
            console.log("token is going to expire/expired. Renewing.....");
            let tokenPromise = generateWatsonXToken();
            tokenPromise.then((resp) => {
                //console.log("resp",resp);
                ibmConfig["tokenResp"] = resp;
                fs.writeFileSync("watson-config.local.json", JSON.stringify(ibmConfig, null, 4));
                console.log("token renewed");
                if (callback) {
                    console.log("using regenerated token");
                    callback();
                }
            })
            .catch((error)=>{
                error.text().then(text => {
                    const errorDetails = {
                      status: response.status,
                      statusText: response.statusText,
                      body: text
                    };
                    console.log("error while genetating token ",errorDetails);
                });
            });
        } else {
            console.log("Token valid till ", expiryTime);
            if (callback) {
                console.log("using cached token");
                callback();
            }
        }
    }
}

function getToken() {
    return ibmConfig["tokenResp"]["access_token"];
}

async function generateWatsonXToken() {
    return new Promise((resolve,reject) => {
        let reqBody = ibmConfig.TOKEN_BODY + ibmConfig.IBM_CLOUD_API_KEY;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: reqBody
        };
        console.log("reqBody",reqBody);
        try {
            fetch(ibmConfig.TOKEN_GEN_URL, requestOptions).then((resp)=>{
                if(!resp.ok) {
                    reject(resp);
                } else {
                    resolve(resp.json());
                }
            });
        } catch (error) {
            resolve(error);
        }
    });
}

async function sendPromptToWatsonX(prompt, max_token) {
    return new Promise((resolve,reject) => {
        if (max_token != 0) {
            ibmConfig.parameters["max_new_tokens"] = max_token;
        }
        let reqBody = {
            "input": prompt,
            "parameters": ibmConfig.parameters,
            "model_id": ibmConfig.WATSON_API_MODEL,
            "project_id": ibmConfig.IBM_CLOUD_PROJECT_ID
        };
        const headers = {
            'Authorization': "Bearer " + getToken(),
            'Content-Type': 'application/json'
        };
        console.log("reqBody",reqBody);
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(reqBody)
        };
        try {
            fetch(ibmConfig.PROMPT_URL, requestOptions).then((resp)=>{
                if(!resp.ok) {
                    reject(resp);
                } else {
                    resolve(resp.json());
                }
            });
        } catch (error) {
            resolve(error);
        }
    });
}

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
            console.log("users synched locally at " , (new Date()));
            userDataHash = hash;
        } else {
            console.log("users sync cancelled. As no change is done");
        }
    });
    let stringifiedPostData = JSON.stringify(posts);
    hashObject(stringifiedPostData).then(hash => {
        if (postsHash == null || postsHash != hash) {
            fs.writeFileSync("data/posts.json", stringifiedPostData);
            console.log("posts synched locally at " , (new Date()));
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

app.get('/checkGrammar', async (req, res) => {
    const caption = req.query.caption.split("%20").join(" ");
    console.log("checking grammar for ", caption);
    let userId = setToken(req, res);
    if (userData[userId]) {
        let numberOfWords = caption.split(" ").length;
        try {
            let promptResp = await sendPromptToWatsonX("fix the grammar of this text '" + caption + "' reply only the corrected text no quotes or special character or newline just the fixed string I want without any explanation", numberOfWords+5);
            let fixed = { "value": caption };
            console.log("promptResp", promptResp);
            try {
                if (promptResp.results && promptResp.results.length > 0) {
                    let promptRespSplit = promptResp.results[0]["generated_text"].split("\n");
                    fixed["generated_text"] = promptResp.results[0]["generated_text"];
                    if (promptRespSplit.length >= 0) {
                        for (let indx in promptRespSplit) {
                            let respLine = promptRespSplit[indx].trim();
                            if (respLine != "" && Math.abs(respLine.split(" ").length - numberOfWords) < 4) {
                                fixed["value"] = respLine;
                                break;
                            }
                        }
                    } else {
                        promptRespSplit = promptResp.results[0]["generated_text"].split("'");
                        if (promptRespSplit.length >= 3) {
                            fixed["value"] = promptRespSplit[2];
                        } else {
                            fixed["value"] = promptResp.results[0]["generated_text"];
                        }
                    }
                }
            } catch (e) {
                console.log("error checking grammar",e);
            }
            res.json(fixed);
        } catch (e) {
            res.json({"error":e});
        }
    } else {
        res.json({});
    }
});

app.get('/checkLogin', (req, res) => {
    let userId = setToken(req, res);
    res.send(JSON.stringify({ "msg": 'logged in user ' + userId, "userId": userId, "loggedIn": userId == undefined ? false : true }));
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        let originalFileNameSplit = file.originalname.split(".");
        let newFileName = generateUUID() + "." + originalFileNameSplit[originalFileNameSplit.length - 1];
        cb(null, `${"d-" + Date.now()}-${newFileName}`);
    }
});

const upload = multer({ storage: storage });

app.post('/postStatus', upload.single('image'), (req, res) => {
    const token = req.body.token;
    const userId = tokens[token];
    if (!userId) {
        return res.status(400).send({ "error": 'Invalid Session' });
    } else {
        const caption = req.body.caption;
        const aigenerate = req.body.aigenerate === 'true';
        const imageFile = req.file;

        const postData = {
            caption: caption,
            userId: userId,
            imageUrl: imageFile ? imageFile.path : null,
            aigenerate: aigenerate,
        };
        let postId = generateUUID2() + "-d-" + Date.now();
        let post = { "id": postId, "image": imageFile ? imageFile.filename : null, "caption": caption, "visibility": EVERYONE, "userId": userId, "date": (new Date()), "likes": [], "comments": [] };
        userData[userId]["posts"].push(postId);
        posts[postId] = post;
        console.log("new post created by " + userId, post);
        if (aigenerate) {
            if (generateImageFunc) {
                console.log("content will get generated using AI asynchronously");
                generatePostUsingAI(caption, userId, postId);
            }
            res.status(200).send({ "message": 'content will get generated using AI asynchronously check after few minutes' });
        } else {
            res.status(200).send({ "message": 'Status update success' });
        }
    }
});

app.get('/searchUser', (req, res) => {
    let userId = setToken(req, res);
    const userIdToSearch = req.query.userIdToSearch;
    let obj = {};
    let userSearched = userData[userIdToSearch];
    let user = userData[userId];
    if (userIdToSearch == userId) {
        obj["error"] = `You can't send friend request to yourself.`;
    } else if (userSearched) {
        obj["userId"] = userSearched.id;
        obj["friends"] = userSearched.friends ? userSearched.friends.length : 0;
        obj["totalPosts"] = userSearched.posts ? userSearched.posts.length : 0;
        obj["mutualFriends"] = [];
        if (userSearched.friends.indexOf(userId) > -1) {
            obj["buttonLabel"] = "You two are already friends";
        } else if (userSearched.friendRequests.indexOf(userId) > -1) {
            obj["buttonLabel"] = "Friend Request Already Sent";
        } else if (user.friendRequests.indexOf(userIdToSearch) > -1) {
            obj["buttonLabel"] = "You already have a friend request from " + userIdToSearch;
        } else {
            obj["buttonLabel"] = "Send Friend Request";
        }
        if (userSearched.friends && userSearched.friends.length > 0 && user.friends && user.friends.length > 0) {
            for (let friendIndx in user.friends) {
                let friendId = user.friends[friendIndx];
                if (userSearched.friends.indexOf(friendId) > -1) {
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
    let obj = { "friendRequests": [], "notifications": [], "friends": [] };
    if (user) {
        obj["friendRequests"] = user.friendRequests ? reverseArray(user.friendRequests) : user.friendRequests;
        obj["notifications"] = user.notifications ? reverseArray(user.notifications) : user.notifications;
        obj["friends"] = user.friends ? reverseArray(user.friends) : user.friends;
    }
    res.send(JSON.stringify(obj));
});

app.get('/likeOrUnlikePost', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const postId = req.query.postId;
    let post = posts[postId];
    let obj = { "likes": [] };
    if (user && post) {
        if (!post.likes) {
            post["likes"] = [];
        }
        let likedNotification = userId + " liked your post " + post.id;
        let unlikedNotification = userId + " un-liked your post " + post.id;
        let currentNotification = '';
        if (post["likes"].indexOf(userId) == -1) {
            post["likes"].push(userId);
            currentNotification = likedNotification;
        } else {
            post["likes"].splice(post["likes"].indexOf(userId), 1);
            currentNotification = unlikedNotification;
        }
        if (post.userId != userId) {
            let friend = userData[post.userId];
            if (friend) {
                if (!friend.notifications) {
                    friend.notifications = [];
                }
                if (friend.notifications.indexOf(likedNotification) > -1) {
                    friend.notifications.splice(friend.notifications.indexOf(likedNotification), 1);
                }
                if (friend.notifications.indexOf(unlikedNotification) > -1) {
                    friend.notifications.splice(friend.notifications.indexOf(unlikedNotification), 1);
                }
                friend.notifications.push(currentNotification);
            }
        }
        obj["likes"] = post["likes"];
    }
    res.send(JSON.stringify(obj));
});

app.get('/commentOnPost', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const postId = req.query.postId;
    const comment = req.query.comment;
    let post = posts[postId];
    let obj = { "comments": [] };
    if (user && comment && comment.trim() != '' && post) {
        if (!post.comments) {
            post["comments"] = [];
        }
        post["comments"].push({ "comment": comment.trim(), "date": (new Date()), "user": userId });
        if (post.userId != userId) {
            let friend = userData[post.userId];
            if (friend) {
                if (!friend.notifications) {
                    friend.notifications = [];
                }
                friend.notifications.push(userId + " commented on your post " + postId);
            }
        }
        obj["comments"] = post["comments"];
    }
    res.send(JSON.stringify(obj));
});

app.get('/sendFriendRequest', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let resp = {};
    let friend = userData[friendId];
    if (user && friend && friendId != userId) {
        if (!friend.friendRequests) {
            friend.friendRequests = [];
        }
        if (!user.friendRequests && user.friendRequests.indexOf(friendId) > -1) {
            resp = { "message": "You already have a friend request from " + friendId };
        } else if (friend.friendRequests.indexOf(userId) == -1) {
            friend.friendRequests.push(userId);
            friend.notifications.push("You have one friend request from @" + userId);
            resp = { "message": "Friend Request Sent" };
        } else {
            resp = { "message": "Friend Request Already Sent Before" };
        }
    } else {
        resp = { "message": "Invalid Session" };
    }
    res.send(JSON.stringify(resp));
});

app.get('/acceptFriendRequest', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let friend = userData[friendId];
    let resp = {};
    if (user && friend) {
        if (!user.friendRequests || user.friendRequests.indexOf(friendId) == -1) {
            resp = { "message": "Invalid State. There is no such friend request" };
        } else {
            if (!user.friends) {
                user.friends = [];
            }
            if (!friend.friends) {
                friend.friends = [];
            }
            user.friendRequests.splice(user.friendRequests.indexOf(friendId), 1);//remove friend request
            //make both friends of each other
            user.friends.push(friendId);
            friend.friends.push(userId);
            friend.notifications.push(`@${userId} accepted your friend request.`);
            resp = { "message": "Friend Request Accepted", "friendRequests": user.friendRequests ? reverseArray(user.friendRequests) : user.friendRequests, "friends": user.friends ? reverseArray(user.friends) : user.friends };
        }
    } else {
        resp = { "message": "Invalid Session" };
    }
    res.send(JSON.stringify(resp));
});

app.get('/rejectFriendRequest', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let resp = {};
    if (user) {
        if (!user.friendRequests || user.friendRequests.indexOf(friendId) == -1) {
            resp = { "message": "Invalid State. There is no such friend request" };
        } else {
            user.friendRequests.splice(user.friendRequests.indexOf(friendId), 1);//remove friend request
            resp = { "message": "Friend Request Rejected", "friendRequests": user.friendRequests ? reverseArray(user.friendRequests) : user.friendRequests };
        }
    } else {
        resp = { "message": "Invalid Session" };
    }
    res.send(JSON.stringify(resp));
});

app.get('/unFriend', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const friendId = req.query.friendId;
    let friend = userData[friendId];
    let resp = {};
    if (user && friend) {
        if (friend.friends.indexOf(userId) > -1 && user.friends.indexOf(friendId) > -1) {
            friend.friends.splice(friend.friends.indexOf(userId), 1);
            user.friends.splice(user.friends.indexOf(friendId), 1);
            resp = { "message": "Success", "friends": reverseArray(user.friends) };
        }
    } else {
        resp = { "message": "Invalid Session" };
    }
    res.send(JSON.stringify(resp));
});

app.get('/deleteNotification', (req, res) => {
    let userId = setToken(req, res);
    let user = userData[userId];
    const notification = req.query.notification;
    let resp = {};
    if (user && notification && user.notifications && user.notifications.indexOf(notification) > -1) {
        user.notifications.splice(user.notifications.indexOf(notification), 1);
        resp = { "message": "Success", "notifications": user.notifications ? reverseArray(user.notifications) : user.notifications };
    } else {
        resp = { "message": "Invalid Session" };
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
        if (userData[userId]["friends"] && userData[userId]["friends"].length > 0) {
            for (let fIndx in userData[userId]["friends"]) {
                let friendId = userData[userId]["friends"][fIndx];
                let friend = userData[friendId];
                if (friend && friend["posts"] && friend["posts"].length > 0) {
                    posts = [...posts, ...friend["posts"]];
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
    if (userData[userId] && post) {
        let isSelfPost = (userData[userId]["posts"].indexOf(postId) > -1 && post.userId == userId);
        let isFriendsPost = (userData[userId]["friends"] && userData[userId]["friends"].indexOf(post.userId) > -1);
        if (isSelfPost || isFriendsPost) {
            let image = post.image;
            let likes = JSON.stringify(post["likes"] ? post["likes"] : []);
            if (image != null && image.indexOf("http") != 0) {
                fs.readFile("uploads/" + image, (err, data) => {
                    if (err) {
                        res.status(500).send('Error reading the image file');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        let imgData = { "postId": postId, "userId": post.userId, "imgData": data, 'caption': post.caption, 'date': post.date, 'likes': likes, 'comments': JSON.stringify(post.comments) };
                        res.end(JSON.stringify(imgData));
                    }
                });
            } else {
                let captionObj = {};
                if (image != null && image.indexOf("http") == 0) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    captionObj = { "postId": postId, "userId": post.userId, "caption": post.caption, 'imageUrl': image, 'date': post.date, 'likes': likes, 'comments': JSON.stringify(post.comments) };
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    captionObj = { "postId": postId, "userId": post.userId, "caption": post.caption, 'date': post.date, 'likes': likes, 'comments': JSON.stringify(post.comments) };
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

async function generatePostUsingAI(caption, userId, postId) {
    generateImageFunc(caption).then((result) => {
        console.log("image properly generated using AI", result);
        if (result && typeof result == 'object' && result.length > 0) {
            posts[postId]["image"] = result[0];
        }
    })
        .catch((error) => {
            console.log("error generating AI image", error);
        });
}

function signUpIfNewUser(userId) {
    if (!userData[userId]) {
        userData[userId] = { "id": userId, "friendRequests": [], "friends": [], "posts": [], "friendsPosts": [], "notifications": [] };
    }
}

function reverseArray(originalArray) {
    const copiedArray = originalArray.slice();
    const reversedArray = copiedArray.reverse();
    return reversedArray;
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