var lineReader = require('line-reader');
var P = require('bluebird');
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var LRU = require("lru-cache");
var makeSimilar = function (similar) {
    return ({ similar: similar });
};
var makeStats = function (totalWords, totalRequests, avgProcessingTimeNs) {
    return ({ totalWords: totalWords, totalRequests: totalRequests, avgProcessingTimeNs: avgProcessingTimeNs });
};
var makeCommand = function (type, args) {
    return ({ type: type, args: args });
};
/*************************************************************************************************
* @class Server
**************************************************************************************************/
var Server = /** @class */ (function () {
    /*************************************************************************************************
    * Construction
    **************************************************************************************************/
    function Server() {
        /*************************************************************************************************
        * Fields
        **************************************************************************************************/
        this.MAX_WORD_LENGTH = 100;
        this.dict = [];
        this.totalWords = 0;
        this.totalRequests = 0;
        this.totalTime = 0;
        this.avgProcessingTimeNs = 0;
        this.cache = new LRU({ max: 10000, dispose: function (key, n) { return console.log('Cache: ' + key + ' disposed'); } });
        this.cmds = { "similar": this.similar,
            "stats": this.stats };
        for (var i = 0; i < this.MAX_WORD_LENGTH; i++) {
            this.dict[i] = [];
        }
        this.buildDictionary();
    }
    Server.prototype.buildDictionary = function () {
        var _this = this;
        var eachLine = P.promisify(lineReader.eachLine);
        eachLine('./words_clean.txt', function (word) {
            _this.dict[word.length].push(word);
            _this.totalWords++;
        })
            .then(function (err) {
            if (err)
                throw err;
            console.log('Server is up!');
        });
    };
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
    Server.prototype.getHandler = function (cmd, res) {
        this.cmds[cmd.type](this, cmd.args, res);
    };
    /*************************************************************************************************
    * Summary. Handle similar requests
    *
    * @param {Server} svr The class object
    * @param {string} word The word given by the user
    * @param res
    *
    * @return {void}
    **************************************************************************************************/
    Server.prototype.similar = function (svr, word, res) {
        console.log('Server: Handling similar ' + word);
        var result;
        var hrTime = process.hrtime();
        var prevtime = hrTime[0] * 1000000000 + hrTime[1];
        if (svr.cache.get(word) === undefined) {
            result = makeSimilar(svr.dict[word.length].filter(function (currWord) { return svr.isPermutation(word, currWord) && word !== currWord; }));
            svr.cache.set(word, result);
        }
        else {
            console.log('Server: Getting ' + word + ' from cache');
            result = svr.cache.get(word);
        }
        console.log('Server: Sending similar ' + word + ' :' + JSON.stringify(result));
        res.send(result);
        hrTime = process.hrtime();
        var delta = hrTime[0] * 1000000000 + hrTime[1] - prevtime;
        svr.totalTime += delta;
        svr.totalRequests++;
        svr.avgProcessingTimeNs = svr.totalTime / svr.totalRequests;
    };
    /*************************************************************************************************
    * Summary. Check if word2 is a permutation of word1.
    *
    * @param {string} word1 The first word.
    * @param {string} word2 The second word.
    *
    * @return {boolean} true iff word2 is a permutation of word1.
    **************************************************************************************************/
    Server.prototype.isPermutation = function (word1, word2) {
        var charCounter = [];
        for (var i = 0; i < 26; i++)
            charCounter.push(0);
        for (var i = 0; i < word1.length; i++) {
            charCounter[word1[i].charCodeAt(0) - 'a'.charCodeAt(0)]++;
            charCounter[word2[i].charCodeAt(0) - 'a'.charCodeAt(0)]--;
        }
        return charCounter.every(function (n) { return n == 0; });
    };
    /*************************************************************************************************
    * Summary. Handle stats requests
    *
    * @param {Server} svr
    *
    * @return {Stats} Return Data set that satisfied the given query
    **************************************************************************************************/
    Server.prototype.stats = function (svr, value, res) {
        console.log('Server: Handling stats');
        var result = JSON.stringify(makeStats(svr.totalWords, svr.totalRequests, svr.avgProcessingTimeNs));
        res.send(result);
        console.log('Server: Sending stats: ' + result);
    };
    return Server;
}());
/*************************************************************************************************
*  Configure Express
**************************************************************************************************/
var exp = express();
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
var server = new Server();
/*************************************************************************************************
*  Handle get requests
**************************************************************************************************/
exp.get("/api/v1/stats", function (req, res) {
    console.log("Server: GET stats");
    try {
        server.getHandler(makeCommand('stats', ''), res);
        res.status(200);
    }
    catch (e) {
        res.send(e.message);
    }
});
exp.get("/api/v1/similar", function (req, res) {
    if (req.query.word !== undefined) {
        console.log("Server: Received GET similar?word=" + req.query.word);
        try {
            server.getHandler(makeCommand('similar', req.query.word), res);
        }
        catch (e) {
            res.send(e.message);
        }
    }
    else {
        res.send("ERROR: you must provide word");
    }
});
/*************************************************************************************************
* Start listening on the given port
**************************************************************************************************/
exp.listen(8000, function () {
    console.log("Server Started!");
});
