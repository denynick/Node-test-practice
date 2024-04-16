'use strict'

// Imports
import admin from "firebase-admin";
import * as path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Router Constants
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const data = require(path.join(__dirname, "../key.json"));

admin.initializeApp(
    {
        credential: admin.credential.cert(data)
    });

console.log()
export default admin;