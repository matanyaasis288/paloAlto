/************************************** TYPES **********************************************/

export interface Data{
    "id" : string;
    "title" : string;
    "content" : string;
    "views" : number;
    "timestamp" : number
}

export interface Query{
    tag : "Query";
    type? : string;
    property : string;
    value : string
}

export const makeQuery = 
    (property : string, value : string, type? :string): Query => ({tag: "Query", type: type, property: property, value: value});


/*************************************************************************************************
* @class DataQuery 
*
*  Class representing data query
*  the class contains 3 parts:
*    
*    1. The class fields  
*    2. API functions for outside use
*    3. Private string Parsers
*    4. Private helper functions    
* 
**************************************************************************************************/
export class DataQuery {

    /****************************************** FIELDS **************************************************/

    private data : Data[] = []
    
    private operators : string[] = 
        ["EQUAL",
         "GREATER_THAN",
         "LESS_THAN",
         "NOT",
         "OR",
         "AND"]

    private parsers : {} =
        {"EQUAL" : this.parseEqual,
         "GREATER_THAN" : this.parseLessGreaterThan,
         "LESS_THAN" : this.parseLessGreaterThan,
         "NOT" : this.parseNot,
         "OR" : this.parseOrAnd,
         "AND" : this.parseOrAnd}                       
    
    private queryFunctions : {} = 
        {"EQUAL" : this.EQUAL,
         "GREATER_THAN" : this.GREATER_THAN,
         "LESS_THAN" : this.LESS_THAN,
         "NOT" : this.NOT,
         "OR" : this.OR,
         "AND" : this.AND}

    private stringProperties : string[] =
        ["id",
         "title", 
        "content"]    
        
    private numberProperties : string[] = 
        ["views",
        "timestamp"]    

    private properties : string[] = this.stringProperties.concat(this.numberProperties)

    /****************************************** API **************************************************/

    /*************************************************************************************************
    * Summary.
    * 
    * @param {string} rawQuery raw query string sent from the client
    * 
    * @return {string} Return json string with the answer to the query. 
    **************************************************************************************************/
    GET(rawQuery : string) : string {
        let queryType : string = this.parseOperator(rawQuery,this).parsed
        let query : string = rawQuery.substring(queryType.length)

        console.log("DataQuery: GET [" + rawQuery + "]")

        let parsed : Query[] = this.parse(queryType, query)

        let reqData : Data[] = this.queryFunctions[queryType](parsed, this.data, this) 
                        
        return JSON.stringify(reqData,null, 2)
    }   

    /*************************************************************************************************
    * Summary.
    * 
    * @param {string} data  String representation of the Data object to add to the Data Query
    * 
    * @return {boolean} Return if the POST action succeded
    **************************************************************************************************/
    POST(data : string) : boolean{
        /* filter out entity with the same id, if exist */
        let entity : Data = JSON.parse(data)

        this.data = this.data.filter((e : Data) => e.id !== entity.id)
        this.data.push(entity)

        console.log("DataQuery: POST updated data [" + JSON.stringify(this.data) + "]")

        return true
    }

    /*************************************************************************************************
    * Summary. Runs equal query on data
    * 
    * @param {Query[]} query List of queries to run, here the length will always be 1.
    * @param {Data[]} data The data to run the query on.
    * @param {dataQuery} dataQuery.
    * 
    * @return {Data[]} Return Data set that satisfied the given query
    **************************************************************************************************/
    EQUAL(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        return data.filter((e : Data) => 
            dataQuery.numberProperties.some((p) => p === query[0].property) ? e[query[0].property] === parseInt(query[0].value) :
                                                                              e[query[0].property] === query[0].value)
    }

    /*************************************************************************************************
    * Summary. Runs greater than query on data
    * 
    * @param {Query[]} query List of queries to run, here the length will always be 1.
    * @param {Data[]} data The data to run the query on.
    * @param {dataQuery} dataQuery.
    * 
    * @return {Data[]} Return Data set that satisfied the given query
    **************************************************************************************************/
    GREATER_THAN(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        if(!dataQuery.isNumberProperty(query[0].property) || isNaN(parseInt(query[0].value)))
            throw new Error("ERROR: property must be a number property, value must be a number.")
        
        return data.filter((e : Data) => e[query[0].property] > parseInt(query[0].value))
    }

    /*************************************************************************************************
    * Summary. Runs less than query on data.
    * 
    * @param {Query[]} query List of queries to run, here the length will always be 1.
    * @param {Data[]} data The data to run the query on.
    * @param {dataQuery} dataQuery.
    * 
    * @return {Data[]} Return Data set that satisfied the given query.
    **************************************************************************************************/
    LESS_THAN(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        if(!dataQuery.isNumberProperty(query[0].property) || isNaN(parseInt(query[0].value)))
            throw new Error("ERROR: property must be a number property, value must be a number")

        return data.filter((e : Data) => e[query[0].property] < parseInt(query[0].value))
    }

    /*************************************************************************************************
    * Summary. Runs and query on data - AND(queries[0], ...., queries[n-1])(data)
    * 
    * @param {Query[]} query List of queries to run.
    * @param {Data[]} data The data to run the query on.
    * @param {dataQuery} dataQuery.
    * 
    * @return {Data[]} Return Data set that satisfied the given query.
    **************************************************************************************************/
    AND(queries : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        return queries.reduce((acc, curr) => 
            dataQuery.queryFunctions[curr.type]([makeQuery(curr.property, curr.value, curr.type)], acc, dataQuery), dataQuery.data)
    }

    /*************************************************************************************************
    * Summary. Runs or query on data - OR(queries[0], ...., queries[n-1])(data)
    * 
    * @param {Query[]} query List of queries to run.
    * @param {Data[]} data The data to run the query on.
    * @param {dataQuery} dataQuery.
    * 
    * @return {Data[]} Return Data set that satisfied the given query.
    **************************************************************************************************/
    OR(queries : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        return queries.reduce((acc, curr) => 
               dataQuery.queryFunctions[curr.type]([makeQuery(curr.property,curr.value, curr.type)], dataQuery.data, dataQuery)
                        .filter((data2 : Data) => !acc.some((data1) => data1 === data2))
                        .concat(acc),
               [])
    }

    /*************************************************************************************************
    * Summary. Runs not query on data - NOT(query[0])(data)
    * 
    * @param {Query[]} query List of queries to run, here the length will always be 1.
    * @param {Data[]} data The data to run the query on.
    * @param {dataQuery} dataQuery.
    * 
    * @return {Data[]} Return Data set that satisfied the given query.
    **************************************************************************************************/
    NOT(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        let queried : Data[] = 
            dataQuery.queryFunctions[query[0].type]([makeQuery(query[0].property, query[0].value, query[0].type)], dataQuery.data, dataQuery)
        
        return dataQuery.data.filter((data2 : Data) => !queried.some((data1) => data1 === data2))
    }


    /************************************** Parser **********************************************/

    /*************************************************************************************************
    * Summary. Main parser, takes the parser that mapped to queryType
    *          and parse query. 
    * 
    * @param {string} queryType The type of the query to parse.
    * @param {string} query Raw query string to parse.
    * 
    * @return {Query[]} List of parsed queries. 
    **************************************************************************************************/
    private parse(queryType : string, query : string) : Query[]{
        console.log("DataQuery: Parsing " + queryType)

        return this.parsers[queryType](queryType, query, this)
    }

    /*************************************************************************************************
    * Summary. Parse equal expressions 
    * 
    * @param {string} queryType The type of the query to parse.
    * @param {string} query Raw query string to parse.
    * @param {DataQuery} dataQuery 
    * 
    * @return {Query[]} List of parsed queries. 
    **************************************************************************************************/
    private parseEqual(queryType : string, query : string, dataQuery : DataQuery) : Query[] {
        let propertyValuePair = dataQuery.parsePair(query, dataQuery).parsed

        console.log("DataQuery: EQUAL Property[" + propertyValuePair[0] + "] Value[" + propertyValuePair[1] + "]")

        return [makeQuery(propertyValuePair[0], propertyValuePair[1], "EQUAL")]
    }

    /*************************************************************************************************
    * Summary. Parse greater than and less than expressions 
    * 
    * @param {string} queryType The type of the query to parse.
    * @param {string} query Raw query string to parse.
    * @param {DataQuery} dataQuery 
    * 
    * @return {Query[]} List of parsed queries. 
    **************************************************************************************************/
    private parseLessGreaterThan(queryType : string, query : string, dataQuery : DataQuery) : Query[]{
        let propertyValuePair = dataQuery.parsePair(query, dataQuery).parsed

        console.log("DataQuery: " + queryType + " Property[" +  propertyValuePair[0] + "] Value[" + propertyValuePair[1] + "]")

        return [makeQuery(propertyValuePair[0], propertyValuePair[1], queryType)]
    }

    /*************************************************************************************************
    * Summary. Parse not expressions 
    * 
    * @param {string} queryType The type of the query to parse.
    * @param {string} query Raw query string to parse.
    * @param {DataQuery} dataQuery 
    * 
    * @return {Query[]} List of parsed queries. 
    **************************************************************************************************/
    private parseNot(queryType : string, query : string, dataQuery : DataQuery) : Query[] {
        if(query.indexOf('(') !== 0 || query.indexOf(')') === query.length - 1)
            throw new Error("ERROR: parsing error")

        query = query.substring(1,query.length - 1)
        let operator = dataQuery.parseOperator(query, dataQuery).parsed
        let rawPair = dataQuery.parseOperator(query, dataQuery).rest
        let propertyValuePair = dataQuery.parsePair(rawPair, dataQuery).parsed

        return [makeQuery(propertyValuePair[0], propertyValuePair[1], operator)]
    }

    /*************************************************************************************************
    * Summary. Parse or and and expressions 
    * 
    * @param {string} queryType The type of the query to parse.
    * @param {string} query Raw query string to parse.
    * @param {DataQuery} dataQuery 
    * 
    * @return {Query[]} List of parsed queries. 
    **************************************************************************************************/
    private parseOrAnd(queryType : string, query : string, dataQuery : DataQuery) : Query[]{
        let subQueries : Query[] = []
    
        /* parse (op(ex1,ex2),op(ex1,ex2)+) */
        query = query.substring(1)
        while(query.length > 0)
        {
            let operator = dataQuery.parseOperator(query, dataQuery).parsed
            let rawPair = dataQuery.parseOperator(query, dataQuery).rest
            let propertyValuePair = dataQuery.parsePair(rawPair, dataQuery).parsed
            subQueries.push(makeQuery(propertyValuePair[0], propertyValuePair[1], operator))   
            query = dataQuery.parsePair(rawPair, dataQuery).rest.substring(1)
        }

        return subQueries
    }

    /*************************************************************************************************
    * Summary. parse operators
    * 
    * @param {string} query The query to parse.
    * @param {type} dataQuery 
    * 
    * @return {{parsed : string, rest : string}} parsed is the operator that parsed, 
    *                                            rest is the rest of the string to be parsed
    **************************************************************************************************/
    private parseOperator = (query : string, dataQuery : DataQuery) : {parsed : string, rest : string} => {
        let parse = dataQuery.operators.map((op) => query.substring(0, op.length) === op ? op : undefined)
                             .reduce((acc, curr) => curr !== undefined ? curr : acc, undefined) 

        if(parse === undefined)
            throw new Error("ERROR: parsing error")                          

        return {parsed : parse, rest : query.substring(parse.length)}                 
    }

    /*************************************************************************************************
    * Summary. parse pairs
    * 
    * @param {string} query The query to parse.
    * @param {type} dataQuery 
    * 
    * @return {{parsed : string, rest : string}} parsed is the operator that parsed, 
    *                                            rest is the rest of the string to be parsed
    **************************************************************************************************/
    private parsePair = (query : string, dataQuery : DataQuery) : {parsed : string[], rest : string} => {
        let PARENS_LENGTH = 2
        
        if(query.indexOf('(') !== 0 || query.indexOf(')') === -1)
            throw new Error("ERROR: parsing error")

        let pair : string = query.substring(query.indexOf('(') + 1, query.indexOf(')'))

        if(pair.split(",").length !== 2)
            throw new Error("ERROR: parsing error")

        return  {parsed : pair.split(","), rest : query.substring(pair.length + PARENS_LENGTH)}
    }


    /************************************** HELPERS **********************************************/


    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    private isNumberProperty = (property : string) => this.numberProperties.some((p) => p === property)

}


