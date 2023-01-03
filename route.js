const express = require('express')
const dbo = require('./dbconnection')
const router = express.Router()


router.get('/',(req,res)=>{
    dbo.db.collection('activation_code_details').find().then((ands)=>{
            console.log(ands);
            res.send(ands)
        })
})
