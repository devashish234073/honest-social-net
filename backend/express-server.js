const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;
const cookies = [];

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