import * as DQ from "./DataQuery"; 
var assert = require('assert');


/*************************************************************************************************
* Build data query
**************************************************************************************************/
let dataQuery = new DQ.DataQuery()

dataQuery.POST('{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222}')
dataQuery.POST('{"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333}')
dataQuery.POST('{"id":"d","title":"dToh","content":"acd","views":4,"timestamp":444}')
dataQuery.POST('{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555}')
dataQuery.POST('{"id":"f","title":"dToh","content":"efik","views":6,"timestamp":666}')
dataQuery.POST('{"id":"g","title":"dToh","content":"bgh","views":6,"timestamp":777}')
dataQuery.POST('{"id":"h","title":"dToh","content":"bgh","views":8,"timestamp":888}')
dataQuery.POST('{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":0}')
dataQuery.POST('{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}')
dataQuery.POST('{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}')

/*************************************************************************************************
* Test LESS_THAN
**************************************************************************************************/
assert.deepStrictEqual(JSON.parse(dataQuery.GET('LESS_THAN(views,3)')),
    JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222}]'))
assert.deepStrictEqual(JSON.parse(dataQuery.GET('LESS_THAN(views,5)')),
    JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222}, \
                 {"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333}, \
                 {"id":"d","title":"dToh","content":"acd","views":4,"timestamp":444}]'))
assert.deepStrictEqual(JSON.parse(dataQuery.GET('LESS_THAN(timestamp,222)')),
    JSON.parse('[{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))                 

/*************************************************************************************************
* Test GREATER_THAN
**************************************************************************************************/                 
assert.deepStrictEqual(JSON.parse(dataQuery.GET('GREATER_THAN(views,8)')),
    JSON.parse('[{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}, \
                 {"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]')) 
assert.deepStrictEqual(JSON.parse(dataQuery.GET('GREATER_THAN(timestamp,888)')),
    JSON.parse('[{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}]'))                   
assert.deepStrictEqual(JSON.parse(dataQuery.GET('GREATER_THAN(views,100)')),
    JSON.parse('[]')) 

/*************************************************************************************************
* Test EQUAL
**************************************************************************************************/
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(id,"i")')),
    JSON.parse('[{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}]'))
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(title,"iTok")')),
    JSON.parse('[{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}, \
                 {"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))     
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(views,5)')),
    JSON.parse('[{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555}]'))  
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(content,"acd")')),
    JSON.parse('[{"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333}, \
                 {"id":"d","title":"dToh","content":"acd","views":4,"timestamp":444}]'))     
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(views,6)')),
    JSON.parse('[{"id":"f","title":"dToh","content":"efik","views":6,"timestamp":666}, \
                 {"id":"g","title":"dToh","content":"bgh","views":6,"timestamp":777}]'))       
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(timestamp,666)')),
    JSON.parse('[{"id":"f","title":"dToh","content":"efik","views":6,"timestamp":666}]'))                                       
assert.deepStrictEqual(JSON.parse(dataQuery.GET('EQUAL(timestamp,11111)')),
    JSON.parse('[]'))

/*************************************************************************************************
* Test NOT
**************************************************************************************************/   
assert.deepStrictEqual(JSON.parse(dataQuery.GET('NOT(EQUAL(id,"b"))')),
    JSON.parse('[{"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333},' +
                 '{"id":"d","title":"dToh","content":"acd","views":4,"timestamp":444},' +
                 '{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
                 '{"id":"f","title":"dToh","content":"efik","views":6,"timestamp":666},' +
                 '{"id":"g","title":"dToh","content":"bgh","views":6,"timestamp":777},' +
                 '{"id":"h","title":"dToh","content":"bgh","views":8,"timestamp":888},' +
                 '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
                 '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))

assert.deepStrictEqual(JSON.parse(dataQuery.GET('NOT(EQUAL(title,"dToh"))')),
    JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222},' +
                '{"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333},' +
                '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
                '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))  
                
assert.deepStrictEqual(JSON.parse(dataQuery.GET('NOT(EQUAL(views,6))')),
    JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222},' +
                '{"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333},' +
                '{"id":"d","title":"dToh","content":"acd","views":4,"timestamp":444},' +
                '{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
                '{"id":"h","title":"dToh","content":"bgh","views":8,"timestamp":888},' +
                '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
                '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))      
            
assert.deepStrictEqual(JSON.parse(dataQuery.GET('NOT(EQUAL(timestamp,444))')),
  JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222},' +
              '{"id":"c","title":"aToc","content":"acd","views":3,"timestamp":333},' +
              '{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
              '{"id":"f","title":"dToh","content":"efik","views":6,"timestamp":666},' +
              '{"id":"g","title":"dToh","content":"bgh","views":6,"timestamp":777},' +
              '{"id":"h","title":"dToh","content":"bgh","views":8,"timestamp":888},' +
              '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
              '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))            

/*************************************************************************************************
* Test OR
**************************************************************************************************/               

assert.deepStrictEqual(JSON.parse(dataQuery.GET('OR(EQUAL(id,"e"),EQUAL(title,"iTok")')),
    JSON.parse('[{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
                '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
                '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))

assert.deepStrictEqual(JSON.parse(dataQuery.GET('OR(EQUAL(id,"e"),EQUAL(id,"i"),EQUAL(id,"t")')),
    JSON.parse('[{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
                '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}]'))

assert.deepStrictEqual(JSON.parse(dataQuery.GET('OR(GREATER_THAN(views,7),LESS_THAN(views,3),EQUAL(id,"e")')),
    JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222},' +
                '{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
                '{"id":"h","title":"dToh","content":"bgh","views":8,"timestamp":888},' +
                '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
                '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))                

assert.deepStrictEqual(JSON.parse(dataQuery.GET('OR(GREATER_THAN(timestamp,900),LESS_THAN(timestamp,250),EQUAL(id,"h")')),
    JSON.parse('[{"id":"b","title":"aToc","content":"bgh","views":2,"timestamp":222},' +
                '{"id":"h","title":"dToh","content":"bgh","views":8,"timestamp":888},' +
                '{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999},' +
                '{"id":"k","title":"iTok","content":"efik","views":11,"timestamp":111}]'))

/*************************************************************************************************
* Test AND
**************************************************************************************************/                

assert.deepStrictEqual(JSON.parse(dataQuery.GET('AND(EQUAL(id,"i"),EQUAL(title,"iTok"),EQUAL(views,9)')),
    JSON.parse('[{"id":"i","title":"iTok","content":"efik","views":9,"timestamp":999}]'))

assert.deepStrictEqual(JSON.parse(dataQuery.GET('AND(EQUAL(id,"e"),EQUAL(title,"dToh"),EQUAL(content,"efik"),EQUAL(views,5),EQUAL(timestamp,555)')),
    JSON.parse('[{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555}]'))

assert.deepStrictEqual(JSON.parse(dataQuery.GET('AND(GREATER_THAN(views,4),LESS_THAN(views,8)')),
    JSON.parse('[{"id":"e","title":"dToh","content":"efik","views":5,"timestamp":555},' +
                '{"id":"f","title":"dToh","content":"efik","views":6,"timestamp":666},' +
                '{"id":"g","title":"dToh","content":"bgh","views":6,"timestamp":777}]'))                

assert.deepStrictEqual(JSON.parse(dataQuery.GET('AND(GREATER_THAN(timestamp,900),LESS_THAN(timestamp,250),EQUAL(id,"h")')),
    JSON.parse('[]'))
