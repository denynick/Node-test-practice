// Directives
"use strict";

// Imports 
import express from "express";
import * as path from "path";
import { fileURLToPath } from "url";
import usersRouter from "./routes/users.js";
import ordersRouter from "./routes/orders.js";
import db from './db/connection.js';


// Use File Location of Index and Get Dir
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Application Constants 
const app = express();


// Configuration 
app.disable("x-powered-by");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Preroute MIDDLEWARE ------------------------------------------------------- 
app.use(express.static(path.join(__dirname, "public")));
app.use("/favicon.ico", express.static("public/assets/ico/favicon.ico"));

// ROUTER 
app.use("/users", usersRouter);
app.use("/orders", ordersRouter);


// Routes
app.get("/", (req, res) => {
    console.log("Redirect to users router");
    res.redirect("/users/welcome");
});

app.get("/auth", (req, res) => {
    const error = new Error("Unauthorised It");
    error.status = 401;
    throw error;
});

app.get("/break", (req, res) => {
    throw new Error("Unauthorised It");

});

// Post middleware
app.use((req, res, next) => {
    res.status(404);
    res.format(
        {
            html: () => {
                res.render("404", { url: req.protocol + "://" + req.hostname + req.originalUrl });
            },
            json: () => {
                res.json({ error: "Not found" });
            },
            default: () => {
                res.type("txt").send("Not found");
            }
        });
});

app.use((err, req, res, next) => {
    switch (err.status) {
        case 401:
            handle_401(req, res, next);
            break;
        default:
            handle_500(req, res, next);
            break;
    }
    console.error("You sent me: " + err.stack);
});


function handle_401(req, res, next) {
    res.status(401);
    res.format(
        {
            html: () => {
                res.render("401", {
                    url: req.protocol + "://" + req.hostname + req.originalUrl
                });
            },
            json: () => {
                res.json({ error: "Internal Server Error" });
            },
            default: () => {
                res.type("txt").send("Internal Server Error");
            }
        });
}


function handle_500(req, res, next) {
    res.status(500);
    res.format(
        {
            html: () => {
                res.render("500", {
                    url: req.protocol + "://" + req.hostname + req.originalUrl
                });
            },
            json: () => {
                res.json({ error: "Internal Server Error" });
            },
            default: () => {
                res.type("txt").send("Internal Server Error");
            }
        });
}




/* S code */




// Start Server
app.listen(3000, () => {
    console.log("Server listening...");
}); 