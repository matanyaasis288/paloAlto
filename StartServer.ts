const lineReader = require('line-reader');
const P = require('bluebird');
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const LRU = require("lru-cache")


/************************************** TYPES **********************************************/

interface Similar{
    similar : string[]
}

interface Stats{
    totalWords : number
    totalRequests : number
    avgProcessingTimeNs : number
}

interface Command{
    type : string
    args : string
}

const makeSimilar =
    (similar : string[]) : Similar => 
        ({similar: similar})

const makeStats = 
    (totalWords : number, totalRequests : number, avgProcessingTimeNs :number): Stats => 
        ({totalWords: totalWords, totalRequests: totalRequests, avgProcessingTimeNs: avgProcessingTimeNs});

const makeCommand = 
    (type : string, args : string): Command => 
        ({type: type, args: args});        

/*************************************************************************************************
* @class Server     
**************************************************************************************************/
class Server {

    /*************************************************************************************************
    * Fields
    **************************************************************************************************/
    private MAX_WORD_LENGTH = 100
    private dict : string[][] = []
    private totalWords : number = 0
    private totalRequests : number = 0
    private totalTime : number = 0
    private avgProcessingTimeNs : number = 0   
    private cache = new LRU({max: 10000,
                             dispose: (key, n) => console.log('Cache: ' + key + ' disposed')})
    private cmds : {} = 
        {"similar" : this.similar,
         "stats" : this.stats}

    /*************************************************************************************************
    * Construction
    **************************************************************************************************/
    constructor(){
        for (let i = 0; i < this.MAX_WORD_LENGTH; i++) {
            this.dict[i] = []
        }

        this.buildDictionary()
    }

    private buildDictionary() : void {
        const eachLine = P.promisify(lineReader.eachLine)
        
        eachLine('./words_clean.txt', (word : string) => {
            this.dict[word.length].push(word)
            this.totalWords++
        })
        .then((err) => {
            if(err) throw err
            console.log('Server is up!')
        })
    }

    /*************************************************************************************************
    * Methods
    **************************************************************************************************/

    /*************************************************************************************************
    * Summary. Handler get http requests
    * 
    * @param {Command} cmd The cmd recived as get request
    * @param res 
    * 
    * @return {void} 
    **************************************************************************************************/
    public getHandler(cmd : Command, res) : void {
        this.cmds[cmd.type](this, cmd.args, res)          
    }  

    /*************************************************************************************************
    * Summary. Handle similar requests
    * 
    * @param {Server} svr The class object
    * @param {string} word The word given by the user
    * @param res
    * 
    * @return {void}
    **************************************************************************************************/
    private similar(svr : Server, word : string, res) : void {
        console.log('Server: Handling similar ' + word)
        let result 
        let hrTime = process.hrtime();
        let prevtime = hrTime[0] * 1000000000 + hrTime[1]
        
        if(svr.cache.get(word) === undefined){
            result = makeSimilar(svr.dict[word.length].filter(currWord => svr.isPermutation(word, currWord) && word !== currWord))
            svr.cache.set(word, result)
        }
        else{
            console.log('Server: Getting ' + word + ' from cache')
            result = svr.cache.get(word)
        }

        console.log('Server: Sending similar ' + word + ' :' + JSON.stringify(result))
        res.send(result)

        hrTime = process.hrtime();
        let delta = hrTime[0] * 1000000000 + hrTime[1] - prevtime
            
        svr.totalTime += delta
        svr.totalRequests++
        svr.avgProcessingTimeNs = svr.totalTime / svr.totalRequests
    }

    /*************************************************************************************************
    * Summary. Check if word2 is a permutation of word1.
    * 
    * @param {string} word1 The first word.
    * @param {string} word2 The second word.
    * 
    * @return {boolean} true iff word2 is a permutation of word1.
    **************************************************************************************************/
    private isPermutation(word1 : string, word2 : string) : boolean {
        let charCounter : number[] = []

        for (let i = 0; i < 26; i++) 
            charCounter.push(0)
        
        for (let i = 0; i < word1.length; i++) {
            charCounter[word1[i].charCodeAt(0)-'a'.charCodeAt(0)]++
            charCounter[word2[i].charCodeAt(0)-'a'.charCodeAt(0)]--
        }

        return charCounter.every(n => n == 0)
    }

    /*************************************************************************************************
    * Summary. Handle stats requests
    * 
    * @param {Server} svr
    * 
    * @return {Stats} Return Data set that satisfied the given query
    **************************************************************************************************/
    private stats(svr : Server, value : string, res) : void {
        console.log('Server: Handling stats')

        let result = JSON.stringify(makeStats(svr.totalWords, svr.totalRequests, svr.avgProcessingTimeNs))
        res.send(result)
        
        console.log('Server: Sending stats: ' + result)
    }

    
}

/*************************************************************************************************
*  Configure Express
**************************************************************************************************/
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
let server = new Server()

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
    if(req.query.word !== undefined){
        console.log("Server: Received GET similar?word=" + req.query.word)   
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
exp.listen(8000, () => {
    console.log("Server Started!")
})