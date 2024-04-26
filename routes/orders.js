'use strict'

// Imports 
import bodyParser from "body-parser";
import express from "express";
import cookieParser from "cookie-parser";
import { ObjectId } from "mongodb";
import multer from "multer";
import db from "../db/connection.js";
import fb from "../fb/firebase.js"



// Application Objects 
const router = express.Router();
const upload = multer();

//   To modify ---------------------------------------------------
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


// Middleware for This Router 
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(upload.array());


// Routes for This Router (all routes /orders onwards) 

router.get('/', async (req, res) => {
    let collection = await db.collection("Products");

    let products = await collection.find({}).toArray();

    console.log(products.length);
    res.render("products", { products: products });
});


router.get('/new-order', async (req, res) => {
    // Local Variables
    let collection = await db.collection("Products");
    let results = await collection.find({}).toArray();

    console.log(results.length);

    res.render("new-order", { Products: results });
});


router.post('/new-order', allowed, async (req, res) => {
    // Local Variables 
    let collection = await db.collection("Orders");
    let newDoc = {};
    let result;
    let userID;
    fb.auth().getUser(res.locals.uid).then(async (userRecord) => {
        userID = userRecord.uid;
        newDoc.buyer = userID;
        newDoc.game = req.body.game;
        newDoc.cost = parseFloat(req.body.cost);
        newDoc.date = new Date();
        result = await collection.insertOne(newDoc);
    })
        .catch((error) => {
            res.status(409).end();
        });
    res.status(201);
    res.redirect("/orders/my-orders");
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


router.get("/:orderId", allowed, async (req, res, next) => {
    // Local Variables
    let findID;
    let collection = await db.collection("Orders");
    let result;
    let userID;
    fb.auth().getUser(res.locals.uid).then(async (userRecord) => {
        userID = userRecord.uid;
        try {
            findID = new ObjectId(req.params.orderId);
            result = await collection.findOne({ "_id": findID });
        }
        catch (err) {
            // Express cannot catch a thrown error in an async
            next(err);
        }
        if (result) {
            if (userID === result.buyer.toString()) {
                res.render("order", { order: result });
            }
            else {
                // The access is tied to the application logic
                res.redirect(403, "/orders/my-orders");
            }
        }
        else {
            // 404
            next();
        }
    })
        .catch((error) => {
            console.error(error);
            res.redirect(401, "/users/sign-in");
        });
});




export default router; 