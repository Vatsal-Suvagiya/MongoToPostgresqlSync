// const { MongoClient } = require("mongodb");
// var db = null; // global variable to hold the connection


// //   MongoClient.connect(
// //     "mongodb://hardik.patel:Hardik098123@20.204.2.235:37862/app_hirest?appname=MongoDB%20Compass&authSource=admin&compressors=zlib&directConnection=true",
// //     {
// //       useNewUrlParser: true,
// //       useUnifiedTopology: true,
// //     },
// //     function (err, client) {
// //       if (err) {
// //         console.error(err);
// //       }
// //       console.log("connection has been establish successfully...");
// //       db = client.db("app_hirest");
// //     //   return db
// //       console.log("db", db);
// //     }
// //   );

// function connection(){
      
// MongoClient.connect("mongodb://hardik.patel:Hardik098123@20.204.2.235:37862/app_hirest?appname=MongoDB%20Compass&authSource=admin&compressors=zlib&directConnection=true",{useNewUrlParser: true,useUnifiedTopology: true,}).then((client)=>{
//     // console.log("client:",client);
//     if (!client) {
//         console.log("1");   
//         return;
//     }
//     try {
//         console.log("2");
//         db = client.db("app_hirest");
//         db.collection('activation_code_details').findOne().then((ands)=>{
//                 console.log(ands);
//             })
//         // console.log("db:",db);
//         return db
//     } catch (err) {
//         console.log("3");
    
//         console.log(err);
//     }
// })
// }

// module.exports.connection = connection ;


// const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient

// Connection Config using Mongoose
const DATABASE_URL = 'mongodb://hardik.patel:Hardik098123@20.204.2.235:37862/app_hirest?appname=MongoDB%20Compass&authSource=admin&compressors=zlib&directConnection=true'

// mongoose.connect(DATABASE_URL,{useNewUrlParser:true,useUnifiedTopology:true})
// const db = mongoose.connection
// db.on('error', (error) => {console.log(error);})
// db.once('open',() => { console.log('Connected Successfully with MongoDb on Localhost:27017');
// })
function dbConfig() {}

let database

dbConfig.prototype.connectDb = () => { 
    return new Promise((resolve,reject)=>{
        
        MongoClient.connect(DATABASE_URL, { useUnifiedTopology: true }, (err, db) => {
            if(err) {
                throw err
            } else {
                database = db.db();
                console.log('Connected to Mongodb!');
                resolve(database)
            }
        })
    })
}

dbConfig.prototype.getDB = () => {
     if (database) {
         console.log('4');
         return database.db()
     } else {
         console.log('Failed to Connect with Mongodb');
     }
 }

dbConfig.prototype.disconnectDB = () => {
    if (database) {
        console.log('Connection Closed!');
        return database.close();
     }
 }

 module.exports.dbConfig = dbConfig;
