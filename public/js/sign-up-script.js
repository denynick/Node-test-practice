'use strict'

// Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Consts
const domEmail = document.getElementById("user-form").elements["email"];
const domError = document.getElementById("error");
const domForm = document.getElementById("user-form");
const domPassword = document.getElementById("user-form").elements["password"];
const domSubmit = document.getElementById("submit-button");

const firebaseCfg =
{
    apiKey: "AIzaSyAjip6kGsgBecGvu46pI_D9rrJulPzZMYo",
    authDomain: "ssp-nodejs-ede51.firebaseapp.com",
    projectId: "ssp-nodejs-ede51",
    storageBucket: "ssp-nodejs-ede51.appspot.com",
    messagingSenderId: "106243880741",
    appId: "1:106243880741:web:c11dcb39895bd1faa28ccc",
    measurementId: "<your_measurement_id>"
};

// Objects
const firebaseApp = initializeApp(firebaseCfg);
const firebaseAuth = getAuth();



function sign_up() {
    createUserWithEmailAndPassword(firebaseAuth, domEmail.value, domPassword.value)
        .then(async (userCredential) => {
            const idTokenCred = await userCredential.user.getIdToken();
            const jsonBody = JSON.stringify({ idToken: idTokenCred });
            fetch("/users/session-sign-in",
                {
                    method: "POST",
                    headers:
                    {
                        "Content-Type": "application/json",
                    },
                    body: jsonBody,
                })
                .then(() => {
                    window.location.assign("/users/welcome");
                })
                .catch((err) => {
                    // Handle Errors
                });
            domError.innerHTML = "";
        })
// Handle Errors…
        .catch((error) => {
            // Local Variables
            let errMsg;
            switch (error.code) {
                case "auth/invalid-email":
                    errMsg = "Email address is not valid";
                    break;
                case "auth/email-already-in-use":
                    errMsg = "This email already exists";
                    break;
                case "auth/weak-password":
                    errMsg = "The password is too weak";
                    break;
                default:
                    errMsg = "We have an error..." + error.code;
                    break;
                
            }
            domError.innerHTML = errMsg;
        });
}

// Listeners
domForm.addEventListener("change", () => {
    domSubmit.disabled = !domForm.checkValidity();
});
domForm.addEventListener("submit", (event) => {
    event.preventDefault();
    sign_up();
});



