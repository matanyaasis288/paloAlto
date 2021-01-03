import * as DQ from "./DataQuery"; 


const express = require("express")
const server = express()

let dataQuery = new DQ.DataQuery()

dataQuery.POST({
    "id": "abc",
    "title": "Alphabet",
    "content": "A, B, C, ...",
    "views": 1,
    "timestamp": 1555832341
    }
)

server.get("/store", (req, res) => {
    if(req.query === {}){
        console.log("Server: Got POST request")
        res.send("200 OK\n {}")
    }
    else{
        console.log("Server: Got GET " + JSON.stringify(req.query))   
        res.send(dataQuery.GET(req.query.query))
    }
    
})

server.listen(5000, () => {
    console.log("Server: Started!")
})