'use strict'

// Imports 
import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import multer from "multer";

import fb from "../fb/firebase.js"
// import { UserRecord } from "firebase-admin/lib/auth/user-record.js";


// Application Objects 
const router = express.Router();
const upload = multer();



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



// Middleware for This Router 
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(upload.array());



// Routes for This Router (all routes /tokens onwards) 

router.get('/', (req, res) => {
    res.redirect("users/welcome");
});

router.post('/session-sign-in', create_cookie, (req, res) => {
    res.status(200).end();
});

router.get('/sign-in', (req, res) => {
    res.render("sign-in");
});



router.get('/sign-out', (req, res) => {
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

router.get('/sign-up', (req, res) => {
    res.render("sign-up");
});



router.get('/welcome', allowed, (req, res) => {
    fb.auth().getUser(res.locals.uid).then((userRecord) => {
        const email = userRecord.email;

        res.render("welcome", { email: email });
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






export default router; 