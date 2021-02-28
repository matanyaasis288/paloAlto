import {makeCommand} from "./Server"; 
import * as svr from "./Server"; 

const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const exp = express()

exp.use(cors({
    'allowedHeaders': ['Content-Type'],
    'origin': '*',
    'preflightContinue': true
}));
exp.use(bodyParser.json());       
exp.use(bodyParser.urlencoded({    
  extended: true
})); 


/*************************************************************************************************
*  Construct the serverObj object
**************************************************************************************************/
let server = new svr.Server()

/*************************************************************************************************
*  Handle get requests
**************************************************************************************************/
exp.get("/api/v1/stats", (req, res) => {
    console.log("Server: GET stats")   
    try{
        server.getHandler(makeCommand('stats',''), res)
        res.status(200)
    }
    catch(e){
        res.send(e.message)
    }      
})

exp.get("/api/v1/similar", (req, res) => {
    console.log(req.query)
    if(req.query.word !== undefined){
        console.log("Server: GET similar?word=" + req.query.word)   
        try{
            server.getHandler(makeCommand('similar', req.query.word), res)
        }
        catch(e){
            res.send(e.message)
        }      
    }
    else{
        res.send("ERROR: you must provide word")
    }
})

/*************************************************************************************************
* Start listening on the given port
**************************************************************************************************/
exp.listen(5000, () => {
    console.log("Server Started!")
})