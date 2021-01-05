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
* Summary.
* 
* @class DataQuery 
* 
**************************************************************************************************/
export class DataQuery {
    
    data : Data[] = []
    
    operators : string[] = ["EQUAL",
                            "GREATER_THAN",
                            "LESS_THAN",
                            "NOT",
                            "OR",
                            "AND"]
    
    queryFunctions : {} = {"EQUAL" : this.EQUAL,
                           "GREATER_THAN" : this.GREATER_THAN,
                           "LESS_THAN" : this.LESS_THAN,
                           "NOT" : this.NOT,
                           "OR" : this.OR,
                           "AND" : this.AND}

    /****************************************** API **************************************************/

    /*************************************************************************************************
    * Summary.
    * 
    * @param {string} rawQuery raw query string sent from the client
    * 
    * @return {string} Return json string with the answer to the query. 
    **************************************************************************************************/
    GET(rawQuery : string) : string {
        let queryType : string = this.getQueryType(rawQuery)
        let query : string = rawQuery.substring(queryType.length)

        console.log("DataQuery: GET [" + rawQuery + "]")

        let proccesed : Query[] = this.process(queryType, query)

        console.log(proccesed)

        let reqData : Data[] = this.queryFunctions[queryType](proccesed, this.data, this) 
                        
        return JSON.stringify(reqData,null, 2)
    }   

    /*************************************************************************************************
    * Summary.
    * 
    * @param {string} data  String representation of the Data object to add to the Data Query
    * 
    * @return {boolean} Return if the POST action succeded
    **************************************************************************************************/
    POST(data : string) : true{
        /* filter out entity with the same id, if exist */
        console.log("Post data: " + data)
        let entity : Data = JSON.parse(data)

        this.data = this.data.filter((e : Data) => e.id !== entity.id)
        this.data.push(entity)

        console.log(JSON.stringify(this.data))

        return true
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {Query[]} query Description.
    * @param {Data[]} data Description.
    * @param {Data[]} dataQuery Description.
    * 
    * @return {Data[]} Return Data set  
    **************************************************************************************************/
    EQUAL(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        console.log(query)

        return data.filter((e : Data) => 
            (query[0].property === "views" || query[0].property === "timestamp") ? e[query[0].property] === parseInt(query[0].value) :
                                                                                   e[query[0].property] === query[0].value)
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    GREATER_THAN(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        return data.filter((e : Data) => e[query[0].property] > parseInt(query[0].value))
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    LESS_THAN(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        return data.filter((e : Data) => e[query[0].property] < parseInt(query[0].value))
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    AND(queries : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        let queried1 : Data[] = dataQuery.queryFunctions[queries[0].type]([makeQuery(queries[0].property, queries[0].value, queries[0].type)], dataQuery.data, dataQuery)
        let queried2 : Data[] = dataQuery.queryFunctions[queries[1].type]([makeQuery(queries[1].property, queries[1].value, queries[1].type)], queried1, dataQuery)

        return queried2
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    OR(queries : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        let queried1 : Data[] = dataQuery.queryFunctions[queries[0].type]([makeQuery(queries[0].property, queries[0].value, queries[0].type)], dataQuery.data, dataQuery)
        let queried2 : Data[] = dataQuery.queryFunctions[queries[1].type]([makeQuery(queries[1].property, queries[1].value, queries[1].type)], dataQuery.data, dataQuery)
        let filteredQueried2 : Data[] = queried2.filter((data2 : Data) => !queried1.some((data1) => data1 === data2))

        return queried1.concat(filteredQueried2)
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    NOT(query : Query[], data : Data[], dataQuery : DataQuery) : Data[]{
        let queried : Data[] = dataQuery.queryFunctions[query[0].type]([makeQuery(query[0].property, query[0].value, query[0].type)], dataQuery.data, dataQuery)
        
        return dataQuery.data.filter((data2 : Data) => !queried.some((data1) => data1 === data2))
    }
    


    /************************************** STRING PROCESSORS **********************************************/

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
   process(queryType : string, query : string) : Query[] {
    console.log("DataQuery: Proccesing " + queryType)

    return  queryType == "EQUAL" ? this.processEqual(query) :
            queryType == "GREATER_THAN" ? this.processLessGreaterThan(queryType, query) :
            queryType == "LESS_THAN" ? this.processLessGreaterThan(queryType, query) : 
            queryType == "NOT" ? this.processNot(query) :
            queryType == "OR" ? this.processOrAnd(queryType, query) :
            queryType == "AND" ? this.processOrAnd(queryType, query) :
            undefined
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    processEqual(query : string) : Query[] {
        let regExp : RegExp = /\(([^)]+)\)/
        let parentExps : string[] = regExp.exec(query).map((exp) => exp.substring(1, exp.length - 1))
        let pair = parentExps[0].split(',')
        let property : string = pair[0]
        let value : string = this.isNumberProperty(property) ? pair[1] : pair[1].substr(1,pair[1].length - 2)

        console.log("DataQuery: EQUAL Property[" + property + "] Value[" + value + "]")

        return [makeQuery(property, value, "EQUAL")]
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    processLessGreaterThan(queryType : string, query : string) : Query[]{
        let regExp : RegExp = /\(([^)]+)\)/
        let parentExps : string[] = regExp.exec(query).map((exp) => exp.substring(1, exp.length - 1))
        let pair = parentExps[0].split(',')
        let property : string = pair[0]
        let value : string = this.isNumberProperty(property) ? pair[1] : pair[1].substr(1,pair[1].length - 2)

        console.log("DataQuery: " + queryType + " Property[" + property + "] Value[" + parseInt(value) + "]")

        if(!this.isNumberProperty(property) || isNaN(parseInt(value))){
            return undefined
        }

        return [makeQuery(property, value, queryType)]
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    processNot(query : string) : Query[] {
        let inQueryType : string = this.getQueryType(query.substring(1, query.length - 1))
        let inQuery : string = query.substring(inQueryType.length)
        let proccesedInQuery : Query[] = this.process(inQueryType, inQuery)

        return [makeQuery(proccesedInQuery[0].property, proccesedInQuery[0].value,proccesedInQuery[0].type)]
    }

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    processOrAnd(queryType : string, query : string) : Query[]{
        query = query.substring(1, query.length - 1)

        let inQueryType1 : string = this.operators[this.findFirstOperator(query)[0]]
        let inQueryType2 : string = this.operators[this.findFirstOperator(query.substring(inQueryType1.length))[0]]
        let inQueryIdx2 : number = this.findFirstOperator(query.substring(inQueryType1.length))[1] + inQueryType1.length
        let inQuery1 : string = query.substring(inQueryType1.length, inQueryIdx2 - 1)
        let inQuery2 : string = query.substring(inQueryType2.length + inQueryIdx2)

        console.log("DataQuery: " + queryType + " Query [" + query + "]")

        let proccesedInQuery1 : Query[] = this.process(inQueryType1, inQuery1)
        let proccesedInQuery2 : Query[] = this.process(inQueryType2, inQuery2)

        return [makeQuery(proccesedInQuery1[0].property, proccesedInQuery1[0].value, proccesedInQuery1[0].type),
                makeQuery(proccesedInQuery2[0].property, proccesedInQuery2[0].value, proccesedInQuery2[0].type)]

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
    isQuery : (queryType :string, rawQuery : string) => boolean =
        (queryType : string, rawQuery : string) => rawQuery.indexOf(queryType) == 0

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    getQueryType : (rawQuery : string) => string = 
        (rawQuery : string) => this.isQuery("EQUAL", rawQuery) ? "EQUAL" :
                               this.isQuery("AND", rawQuery) ? "AND" :
                               this.isQuery("OR", rawQuery) ? "OR" :
                               this.isQuery("NOT", rawQuery) ? "NOT" :
                               this.isQuery("GREATER_THAN", rawQuery) ? "GREATER_THAN" :
                               this.isQuery("LESS_THAN", rawQuery) ? "LESS_THAN" : "ERROR"

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
    isNumberProperty = (property : string | number) => property === "views" || property === "timestamp"

    /*************************************************************************************************
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    **************************************************************************************************/
   findFirstOperator = (query : string) : number[] => {
     return this.operators.map((op, i) => [i, query.indexOf(op)])
                          .reduce((acc, curr) => (curr[1] < acc[1] && curr[1] != -1) ? curr : acc, [-1, Number.MAX_VALUE]) 
   } 



}


