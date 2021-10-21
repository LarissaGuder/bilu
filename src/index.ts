import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import express = require("express");
import cors = require("cors");
import session = require('express-session')
import passport = require('passport')
import { Strategy } from 'passport-spotify'
import consolidate = require('consolidate')


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
                callbackURL: 'http://localhost:' + port + authCallbackPath,
            },
            async function (accessToken, refreshToken, expires_in, profile, done) {
                try {
                    var user = await User.repository.findOne({ spotifyId: profile.id })
                    if (!user) {
                        user = new User()
                        user.spotifyId = profile.id
                        user.userName = profile.username
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

    app.get('/', function (req, res) {
        res.render('index.html', { user: req.user });
    });

    app.get('/account', ensureAuthenticated, function (req, res) {
        res.render('account.html', { user: req.user });
    });

    app.get('/login', function (req, res) {
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
            scope: ['user-read-email', 'user-read-private'],
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
        function (req, res) {
            res.redirect('/');
        }
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.listen(port, function () {
        console.log('App is listening on port ' + port);
    });

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed. Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    }
    // })
}).catch(error => console.log(error));
