import * as DQ from "./DataQuery"; 

let dataQuery = new DQ.DataQuery()

dataQuery.POST({"id" : "1",
                 "title" : "request",
                 "content" : "get a job at Wix",
                 "views" : 1,
                 "timestamp" : 2})

dataQuery.POST({"id" : "2",
                "title" : "request",
                "content" : "get a job at Wix",
                "views" : 1,
                "timestamp" : 0})

console.log({"EQUAL" : 1}["a"])
