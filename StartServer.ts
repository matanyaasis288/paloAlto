import * as DQ from "./DataQuery"; 

/* Start the server */
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const server = express()

server.use(cors({
    'allowedHeaders': ['Content-Type'],
    'origin': '*',
    'preflightContinue': true
}));

server.use( bodyParser.json());       
server.use(bodyParser.urlencoded({    
  extended: true
})); 


/* Construct DataQuery object */
let dataQuery = new DQ.DataQuery()

server.get("/store", (req, res) => {
    if(req.query.query !== undefined){
        console.log("Server: GET " + JSON.stringify(req.query))   
        try{
            res.send(dataQuery.GET(req.query.query))
            res.status(200)
            console.log("Server: RETURN " + dataQuery.GET(req.query.query))
        }
        catch(e){
            res.send(e.Message)
        }      
    }
    else{
        res.send("ERROR: you must provide post or query")
    }
})

server.post("/store", (req, res) => {
    if(req.body !== undefined){
        console.log("Server: POST " + JSON.stringify(req.body))
        dataQuery.POST(JSON.stringify(req.body))
        res.sendStatus(200)
    }
    else{
        res.send("ERROR: you must provide json")
    }
})

server.listen(5000, () => {
    console.log("Server: Started!")
})