// Directives
"use strict";

import { MongoClient } from "mongodb"; 

// Module Constants 
const dbName = "SSP"; 
const dbUName = encodeURIComponent("denynick"); 
const dbPass = encodeURIComponent("MyMongo1"); 
const url = `mongodb+srv://${dbUName}:${dbPass}@node-js.ksovwf7.mongodb.net/?retryWrites=true&w=majority; `

 // Module Objects
 const dbClient = new MongoClient(url);

  // Module Variables
  let conn;
  let db;

try 
{ 
conn = await dbClient.connect(); 
} 
catch(err) 
{ 
console.error(err); 
} 
db = conn.db(dbName); 
export default db;