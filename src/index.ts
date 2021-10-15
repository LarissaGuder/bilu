import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");
import querystring = require('querystring');
import api from './services/api'
import request = require('request'); // "Request" library
require('dotenv').config()
// createConnection().then(async connection => {
const client_id = process.env.CLIENT_ID; // Your client id
const client_secret = process.env.CLIENT_SECRET; // Your secret
var redirect_uri = process.env.REDIRECT_URI; // Your redirect uri
var stateKey = 'spotify_auth_state';
console.log(process.env.CLIENT_ID)
/**
* Generates a random string containing numbers and letters
* @param  {number} length The length of the string
* @return {string} The generated string
*/
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

var stateKey = 'spotify_auth_state';

var app = express();
app.use(express.static(__dirname + '/public'))
    .use(cors())
    .use(cookieParser());

    app.get('/callback', function (req, res) {

        // your application requests refresh and access tokens
        // after checking the state parameter
    
        var code = req.query.code || null;
        var state = req.query.state || null;
        var storedState = req.cookies ? req.cookies[stateKey] : null;
    
        if (state === null || state !== storedState) {
            res.redirect('/#' +
                querystring.stringify({
                    error: 'state_mismatch'
                }));
        } else {
            res.clearCookie(stateKey);
            var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
                },
                headers: {
                    'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
            };
    
            request.post(authOptions, function (error, response, body) {
                if (!error && response.statusCode === 200) {
    
                    var access_token = body.access_token,
                        refresh_token = body.refresh_token;
    
                    var options = {
                        url: 'https://api.spotify.com/v1/me',
                        headers: { 'Authorization': 'Bearer ' + access_token },
                        json: true
                    };
    
                    // use the access token to access the Spotify Web API
                    request.get(options, function (error, response, body) {
                        console.log(body);
                    });
    
                    // we can also pass the token to the browser to make requests from there
                    res.redirect('/#' +
                        querystring.stringify({
                            access_token: access_token,
                            refresh_token: refresh_token
                        }));
                } else {
                    res.redirect('/#' +
                        querystring.stringify({
                            error: 'invalid_token'
                        }));
                }
            });
        }
    });
    
app.get('/login', function (req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }));
});


app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});


//     /**
//      * Generates a random string containing numbers and letters
//      * @param  {number} length The length of the string
//      * @return {string} The generated string
//      */
//     var generateRandomString = function (length: number) {
//         var text = '';
//         var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

//         for (var i = 0; i < length; i++) {
//             text += possible.charAt(Math.floor(Math.random() * possible.length));
//         }
//         return text;
//     };
//     const app = express();
//     const port = process.env.port

//     app.use(express.static(__dirname + '/public'))
//         .use(cors())
//         .use(cookieParser());

//     app.get('/login', function (req, res) {

//         var state = generateRandomString(16);
//         res.cookie(stateKey, state);

//         // your application requests authorization
//         var scope = 'user-read-private user-read-email';
//         res.redirect('https://accounts.spotify.com/authorize?' +
//             querystring.stringify({
//                 response_type: 'code',
//                 client_id: client_id,
//                 scope: scope,
//                 redirect_uri: redirect_uri,
//                 state: state
//             }));
//     });

//     app.get('/callback', function (req, res) {

//         // your application requests refresh and access tokens
//         // after checking the state parameter

//         var code = req.query.code || null;
//         var state = req.query.state || null;
//         var storedState = req.cookies ? req.cookies[stateKey] : null;

//         if (state === null || state !== storedState) {
//             res.redirect('/#' +
//                 querystring.stringify({
//                     error: 'state_mismatch'
//                 }));
//         } else {
//             res.clearCookie(stateKey);

//             const data = {
//                 code: code,
//                 redirect_uri: redirect_uri,
//                 grant_type: 'authorization_code'
//             }

//             const headers = {
//                 headers: {
//                     'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//                 },
//             }

//         api.post('https://accounts.spotify.com/api/token', data, headers).then((response:any) => {
//             if (response.status === 200) {

//                 var access_token = response.data.access_token ,
//                     refresh_token = body.refresh_token;

//                 var options = {
//                     url: 'https://api.spotify.com/v1/me',
//                     headers: { 'Authorization': 'Bearer ' + access_token },
//                     json: true
//                 };

//                 // use the access token to access the Spotify Web API
//                 api.get(options, function (error, response, body) {
//                     console.log(body);
//                 });

//                 // we can also pass the token to the browser to make requests from there
//                 res.redirect('/#' +
//                     querystring.stringify({
//                         access_token: access_token,
//                         refresh_token: refresh_token
//                     }));
//             } else {
//                 res.redirect('/#' +
//                     querystring.stringify({
//                         error: 'invalid_token'
//                     }));
//             }
//         });
//     }
//     });

// app.get('/refresh_token', function (req, res) {

//     // requesting access token from refresh token
//     var refresh_token = req.query.refresh_token;
//     var authOptions = {
//         url: 'https://accounts.spotify.com/api/token',
//         headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
//         form: {
//             grant_type: 'refresh_token',
//             refresh_token: refresh_token
//         },
//         json: true
//     };

//     api.post('https://accounts.spotify.com/api/token', function (error: any, response: { statusCode: number; }, body: { access_token: any; }) {
//         if (!error && response.statusCode === 200) {
//             var access_token = body.access_token;
//             res.send({
//                 'access_token': access_token
//             });
//         }
//     });
// });

// console.log("Inserting a new user into the database...");
// const user = new User();
// user.firstName = "Timber";
// user.lastName = "Saw";
// user.age = 25;
// await connection.manager.save(user);
// console.log("Saved a new user with id: " + user.id);

// console.log("Loading users from the database...");
// const users = await connection.manager.find(User);
// console.log("Loaded users: ", users);

// console.log("Here you can setup and run express/koa/any other framework.");
app.listen(process.env.PORT || 3000, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT || 3000}`)
})
// }).catch (error => console.log(error));
