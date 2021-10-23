import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import express = require("express");
import cors = require("cors");
import session = require('express-session')
import passport = require('passport')
import { Strategy } from 'passport-spotify'
import consolidate = require('consolidate')
import { Request, Response, NextFunction } from 'express'
import { ensureAuthenticated } from './middleware/auth'
import { recommendationService } from "./services/recommendationService";

import axios, { AxiosInstance } from "axios";


require('dotenv').config()
createConnection().then(async connection => {

    var port = process.env.PORT;
    var authCallbackPath = '/callback';

    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session. Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing. However, since this example does not
    //   have a database of user records, the complete spotify profile is serialized
    //   and deserialized.
    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });

    // Use the SpotifyStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, expires_in
    //   and spotify profile), and invoke a callback with a user object.
    passport.use(
        new Strategy(
            {
                clientID: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                callbackURL: 'http://fed4-164-163-144-45.ngrok.io' + authCallbackPath,
            },
            async function (accessToken, refreshToken, expires_in, profile, done) {
                try {
                    var user = await User.repository.findOne({ spotifyId: profile.id })
                    if (!user) {
                        user = new User()
                        user.spotifyId = profile.id
                        user.userName = profile.username
                        user.acessToken = accessToken
                        user.refreshToken = refreshToken
                        await User.repository.save(user)

                    } else {
                        user.acessToken = accessToken
                        user.refreshToken = refreshToken
                        await User.repository.save(user)

                    }

                    return done(null, profile);

                } catch (error) {
                    return done(error, profile);

                }
            }
        )
    );

    var app = express();

    // configure Express
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');

    app.use(
        session({ secret: 'keyboard cat', resave: true, saveUninitialized: true })
    );
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(express.static(__dirname + '/public'));

    app.engine('html', consolidate.nunjucks);

    // app.get('/', function (req: Request, res: Response) {
    // res.render('index.html', { user: req.user });
    // });

    // app.get('/account', ensureAuthenticated, function (req: Request, res: Response) {
    //     res.render('account.html', { user: req.user });
    // });



    app.get('/', ensureAuthenticated, async function (req: Request, res: Response) {

        const user = req.user as any
        const userDb = await User.repository.findOne({ spotifyId: user.id })
        let mediaValence = 0
        const api = await axios({
            method: 'get',
            baseURL: 'https://api.spotify.com/v1/me/player/recently-played?limit=10',
            headers: {
                Authorization: `Bearer ${userDb.acessToken}`,
                'Content-Type': 'application/json'
            }
        })
            .then(async function (response) {
                const resp = response.data as any
                let songs = ''
                resp.items.forEach(element => {
                    songs += element.track.id + `,`
                });

                console.log(songs.slice(0, -1))
                const songsAPI = await axios({
                    method: 'get',
                    baseURL: `https://api.spotify.com/v1/audio-features?ids=${songs}`,
                    headers: {
                        Authorization: `Bearer ${userDb.acessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(function (response) {
                        const resp = response.data as any
                        let valenceMedia = 0
                        resp.audio_features.forEach(element => {
                            valenceMedia += parseFloat(element.valence)
                        });
                        console.log(resp.audio_features.length)
                        // console.log(valenceMedia / resp.audio_features.length )
                        mediaValence = valenceMedia / resp.audio_features.length
                        // 
                        let shrekao = {
                            frase: '',
                            type: 0
                        }
                        if (mediaValence == 0)
                            shrekao.frase = 'Não foi possível determinar sua shrekness'//, shrekao.image = 'https://files.nsctotal.com.br/styles/paragraph_image_style/s3/imagesrc/19467670.jpg?qr1o4vY_hiIfLOo.ByZ_VlTj5YwnA.zH&itok=FAVEdsPc'

                        else if (mediaValence > 0 && mediaValence < 0.25)
                            shrekao.frase = 'Mais triste que o Shrek quando perde a Fiona', shrekao.type = 1 //shrekao.image = 'https://i.ytimg.com/vi/pDwVHvTvZGk/maxresdefault.jpg'
                        else if (mediaValence >= 0.25 && mediaValence < 0.50)
                            shrekao.frase = 'Mais triste que o Shrek quando perde o Pantano', shrekao.type = 2 //shrekao.image = 'https://i.ytimg.com/vi/psFzJv8g6jc/maxresdefault.jpg'
                        else if (mediaValence >= 0.50 && mediaValence < 0.75)
                            shrekao.frase = 'Mais feliz que o Shrek quando dá o sapo inflável a Fiona', shrekao.type = 3 //shrekao.image = 'https://s2.glbimg.com/4XA_kCAH1gCp60Ue60g-tBSOpuA=/607x350/smart/e.glbimg.com/og/ed/f/original/2018/05/18/shrek.jpg'
                        else
                            shrekao.frase = 'Mais feliz que o Shrek ao som de All Star', shrekao.type = 4 //shrekao.image = 'https://s.yimg.com/uu/api/res/1.2/AswZkqvI6WCQ5k03h_PnDg--~B/aD0zMDA7dz02MDA7YXBwaWQ9eXRhY2h5b24-/https://media.zenfs.com/es/tomatazos_56/632614b7918d69420b6b7c14d487c320'

                        console.log(mediaValence)
                        // const formtHtml = `
                        // <div class="bgimg-1" style="background-image: ${shrekao.image};">
                        //     <div class="caption">
                        //         <span class="border"> ${shrekao.frase }</span><br>
                        //     </div>
                        // </div>
// `
                        res.render('index.html', { shrekao, user: req.user });
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
                // 
            })
            .catch(function (error) {
                console.log(error);
            });

    });
    app.get('/login', function (req: Request, res: Response) {
        res.render('login.html', { user: req.user });
    });
    // GET /auth/spotify
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request. The first step in spotify authentication will involve redirecting
    //   the user to spotify.com. After authorization, spotify will redirect the user
    //   back to this application at /auth/spotify/callback
    app.get(
        '/auth/spotify',
        passport.authenticate('spotify', {
            scope: ['user-read-email', 'user-read-private', 'user-top-read', 'user-read-recently-played'],
        })
    );

    // GET /auth/spotify/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request. If authentication fails, the user will be redirected back to the
    //   login page. Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get(
        authCallbackPath,
        passport.authenticate('spotify', { failureRedirect: '/login' }),
        function (req: Request, res: Response) {
            res.redirect('/');
        }
    );

    app.get('/logout', function (req: Request, res: Response) {
        req.logout();
        res.redirect('/');
    });

    app.listen(port, function () {
        console.log('App is listening on port ' + port);
    });


}).catch(error => console.log(error));
