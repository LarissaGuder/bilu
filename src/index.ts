import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";
import express = require("express");
import cors = require("cors");
import cookieParser = require("cookie-parser");
import querystring = require('querystring');
import api from './service/api'

createConnection().then(async connection => {

    const app = express();
    const port = process.env.port

    app.use(express.static(__dirname + '/public'))
        .use(cors())
        .use(cookieParser());


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
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
}).catch (error => console.log(error));
