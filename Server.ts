const lineReader = require('line-reader');
const Promise = require('bluebird');


/************************************** TYPES **********************************************/

export interface Similar{
    similar : string[]
}

export interface Stats{
    totalWords : number
    totalRequests : number
    avgProcessingTimeNs : number
}

export interface Command{
    type : string
    args : string
}

export const makeSimilar =
    (similar : string[]) : Similar => 
        ({similar: similar})

export const makeStats = 
    (totalWords : number, totalRequests : number, avgProcessingTimeNs :number): Stats => 
        ({totalWords: totalWords, totalRequests: totalRequests, avgProcessingTimeNs: avgProcessingTimeNs});

export const makeCommand = 
    (type : string, args : string): Command => 
        ({type: type, args: args});        

/*************************************************************************************************
* @class Server     
**************************************************************************************************/
export class Server {

    /*************************************************************************************************
    * Fields
    **************************************************************************************************/
    private MAX_WORD_LENGTH = 100
    private dict : string[][] = []
    private totalWords : number = 0
    private totalRequests : number = 0
    private totalTime : number = 0
    private avgProcessingTimeNs : number = 0                      
    
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
        const eachLine = Promise.promisify(lineReader.eachLine)
        
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
        
        let hrTime = process.hrtime();
        let prevtime = hrTime[0] * 1000000000 + hrTime[1]
        
        let result = makeSimilar(svr.dict[word.length].filter(currWord => svr.isPermutation(word, currWord) && word !== currWord))
        res.send(result)
        console.log('Server: Sending similar ' + word + ' :' + JSON.stringify(result))
    
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


