const { Router } = require("express");
const express= require("express")
// const routes = require("./routes");
// const port = require('./config/env/env')
const bodyParser = require('body-parser');
const flatten = require('flat')
const app=express()
const migration =  require('./migration')
const dbConfig = require('./dbconnection').dbConfig

// console.log("::::",dbo.connection())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

 // global variable to hold the connection

// const client = new MongoClient('mongodb://hardik.patel:Hardik098123@20.204.2.235:37862/app_hirest?appname=MongoDB%20Compass&authSource=admin&compressors=zlib&directConnection=true')

// dbo.db.collection("activation_code_details").findOne({},(err,as)=>{
    //     console.log(as);
    
    // })

    // app.use(bodyParser.json())
    // app.use(bodyParser.urlencoded({ extended: false }));
// app.use(('/',()=>{

// }));
// dbo.db.collection('activation_code_details').find().then((ands)=>{
    //     console.log(ands);
    // })
    // dbo.getDb.collection("activation_code_details").find({})
    // app.use(routes)                                                                                          
//     console.log("db:::",dbo);

// app.get("/123",()=>{
//     console.log("db:::",dbo);

//     dbo.db.collection('activation_code_details').find().then((ands)=>{
//             console.log(ands);
//         })})



const db = new dbConfig();
// console.log("db:::::::",db.connectDb());l
// db.connectDb().then((db)=>{
//     // console.log("database",database);
//     // var resp =  db.collection('app_encryption_details').find({}).forEach((result)=>{
//     //     // console.log('2',result);  
//     //     console.log('3',flatten(result,{safe:true}));
//     //     type   
//     // })




//     db.collection('app_encryption_details').findOne({}).then((result)=>{
// console.log(result);
//             let c= flatten(result,{safe:true})

//             console.log(c);

//             // Object.entries(c).forEach(([key,value]) => {
//             //     if(key == '_id')
//             //     {
//             //         console.log(value.toString());
//             //     }
//             //     if(Array.isArray(value))
//             //     {
//             //         console.log('array');
//             //     }
//             //     if(console.log(value instanceof Date)== true)
//             //     {
//             //         // console.log("time");
//             //     }
//             //     console.log(`typeof:${key}:----------------------------:${value}`,typeof(value));
//             // });


//             if(result)
//             {   
//                 let q= '('
//                 Object.entries(result).forEach(([key,value])=>{
//                     let type = 'varchar(512)'
//                     if(typeof(value)=='number')
//                     {
//                         type = 'int'   
//                     }
//                     else if ((value instanceof Date)== true)
//                     {
//                         type = 'timestamptz'
//                     }
//                     else if(Array.isArray(value))
//                     {
//                         type = 'text[]'
//                     }
//                     else if(typeof(value)=='boolean')
//                     {
//                         type = 'boolean'
//                     }
//                     q = q+ key +" " +type + ','
//                 })
//                 q.substring(0, q.length - 1)
//                 console.log("query:::",q);
//             }
//         })
// })

const pool = require('./postgre_connection')

// migration.createTable('lookup_details')

migration.foreignTable('hirest_survey_details_R_question_json','choices',"question_json_id")



function a(){
    pool.query(`select _id,languages,id from person_details`)
    .then((records)=>{
        records.rows.forEach((records)=>{

            var insert = `insert into person_details_R_languages(person_details_id,person_details_id_id,skills,level,language)`
            
            records.languages.forEach((lan) => {
                lan['language_skills'].forEach((ski)=>{
                    var value = `values('${records._id}',${records.id},`
                    value+= `'${ski["skill"]}','${ski["level"]}','${lan["language"]}')`

                    console.log("query::",insert+value);
                    pool.query(insert+value).then(()=>{
                        console.log("inserted...");
                    })
                    .catch((err)=>{
                        console.log("err:",insert+value);
                        console.log("err:",err);
                    })
                })
                
            });
        })

        
    })
}


// module.exports.dbOperations = dbOperations;
app.listen(3131, () => {
    console.log(`Server listening on port `);
});


