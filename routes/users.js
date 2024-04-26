'use strict'

// Imports 
import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import admin from "firebase-admin";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import fb from "../fb/firebase.js"
import db from '../db/connection.js';


const require = createRequire(import.meta.url);

// Router Constants 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data = require(path.join(__dirname, "../key.json"));

const firebaseCfg =
{
    apiKey: "AIzaSyAjip6kGsgBecGvu46pI_D9rrJulPzZMYo",
    authDomain: "ssp-nodejs-ede51.firebaseapp.com",
    projectId: "ssp-nodejs-ede51",
    storageBucket: "ssp-nodejs-ede51.appspot.com",
    messagingSenderId: "106243880741",
    appId: "1:106243880741:web:c11dcb39895bd1faa28ccc"
};


// Application Objects 
const router = express.Router();
const upload = multer();
initializeApp(firebaseCfg);
const firebaseAuth = getAuth();

/* 
admin.initializeApp(
    {
        credential: admin.credential.cert(data)
    });  */


// Middleware for This Router 
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(upload.array());


// Routes for This Router

router.get('/', (req, res) => {

    res.redirect("users/welcome");

});



router.get('/sign-in', (req, res) => {
    res.render("sign-in");
});
router.post('/sign-in', sign_in, (req, res) => {
    res.status(200);
    res.redirect("/users/welcome");
});




router.get("/sign-up", (req, res) => {
    console.log("Render Sign Up");
    res.render("sign-up", { comment: "" });
});
router.post("/sign-up", create, (req, res) => {
    // If using an HTML form, rather than JS ajax 
    res.status(201);
    res.redirect("/users/welcome");
});


router.get("/welcome", allowed, (req, res) => {
    // Now supports sessions! 
    fb.auth().getUser(res.locals.uid).then((userRecord) => {
        // Local Variables 
        const email = userRecord.email;
        console.log("Render Welcome");
        res.render("welcome", { email: email });
    });
});


router.post('/sign-out', (req, res) => {
    const sessionCookie = req.cookies.session;
    res.clearCookie('session');

    fb.auth().verifySessionCookie(sessionCookie).then((decodedClaims) => {
        fb.auth().revokeRefreshTokens(decodedClaims.sub);
    })
        .then(() => {
            res.redirect("/users/sign-in");
        })
        .catch((error) => {
            res.redirect("/users/sign-in");
        });
});


router.get('/my-orders', allowed, async (req, res) => {
    // Local Variables
    let collection = await db.collection("Orders");
    let findID;
    let result;
    let document;
    fb.auth().getUser(res.locals.uid).then(async (userRecord) => {
        findID = userRecord.uid;
        result = await collection.find({ "buyer": findID }).toArray();
        res.status(200);
        res.render("my-orders", { orders: result });
    })
        .catch((error) => {
            console.error(error);
            res.status(418).end();
        })
});




// Create a User

function create(req, res, next) {
    createUserWithEmailAndPassword(firebaseAuth, req.body.email, req.body.password).then(async (userCredential) => {
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const idToken = await userCredential.user.getIdToken();

        fb.auth().createSessionCookie(idToken, { expiresIn }).then((sessionCookie) => {

            const options = { maxAge: expiresIn, httpOnly: true };
            res.cookie("session", sessionCookie, options);
            next();
        })
            .catch((error) => {
                console.error("ERROR: " + error);
            });
    })
        .catch((error) => {

            const errorCode = error.code;
            const errorMessage = error.message;

            console.error("Failed to create user: " + req.body.email);
            res.status(409);
            res.render("sign-up", { comment: error.code });
        });
}


function sign_in(req, res, next) {
    signInWithEmailAndPassword(firebaseAuth, req.body.email, req.body.password).then(async (userCredential) => {
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const idToken = await userCredential.user.getIdToken();

        fb.auth().createSessionCookie(idToken, { expiresIn }).then((sessionCookie) => {
            const options = { maxAge: expiresIn, httpOnly: true };
            res.cookie("session", sessionCookie, options);
            next();
        })
            .catch((error) => {
                console.error("ERROR: " + error);
            });
    })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;

            console.error("Failed to sign in user: " + req.body.email);
            res.status(409);
            res.render("sign-up", { comment: error.code });
        });
}



function allowed(req, res, next) {
    if (req.cookies.session) {
        fb.auth().verifySessionCookie(req.cookies.session, true)
            .then((decodedClaims) => {
                res.locals.uid = decodedClaims.uid;
                next();
            })
            .catch(function (error) {
                // Forbidden - Identity Known but Refused
                console.error(error);
                res.redirect(403, "/users/sign-in");
            });
    }
    else {
        // Unauth - Must Authenticate
        res.redirect(401, "/users/sign-in");
    }
}


function create_cookie(req, res, next) {
    // Local Const
    const expiresIn = 1000 * 60 * 60 * 24 * 5;
    const idToken = req.body.idToken.toString();
    const options = { maxAge: expiresIn, httpOnly: true };

    // Cookie in ms therefore 5 days
    fb.auth().createSessionCookie(idToken, { expiresIn })
        .then((sessionCookie) => {
            res.cookie("session", sessionCookie, options);
            next();
        })
        .catch((error) => {
            console.error("Error: " + error);
        });
}





// Routes for This Router (all routes /tokens onwards) 







export default router; 