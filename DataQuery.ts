
/* TYPES */

export interface Data{"id" : string;
                      "title" : string;
                      "content" : string;
                      "views" : number;
                      "timestamp" : number}

export class DataQuery {
    data : Data[] = []
    operators : string[] = ["EQUAL", "GREATER_THAN", "LESS_THAN", "NOT", "OR", "AND"]
    queryFunctions : {} = {"EQUAL" : this.EQUAL,
                           "GREATER_THAN" : this.GREATER_THAN,
                           "LESS_THAN" : this.LESS_THAN,
                            "NOT" : this.NOT,
                            "OR" : this.OR,
                            "AND" : this.AND}

    /* API */

    /**
    * Summary. 
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    GET(rawQuery : string) : string {
        let queryType : string = this.getQueryType(rawQuery)
        let query : string = rawQuery.substring(queryType.length)

        console.log(query)

        let proccesed : string[] = this.process(queryType, query)

        let reqData =   queryType == "EQUAL" ? this.EQUAL(proccesed[0], proccesed[1]) :
                        queryType == "GREATER_THAN" ? this.GREATER_THAN(proccesed[0], proccesed[1]) :
                        queryType == "LESS_THAN" ? this.LESS_THAN(proccesed[0], proccesed[1]) : 
                        queryType == "NOT" ? this.NOT(proccesed[0], proccesed[1], proccesed[2]) :
                        queryType == "OR" ? this.OR(proccesed[0], proccesed[1], proccesed[2], proccesed[3], proccesed[4], proccesed[5]) :
                        queryType == "AND" ? this.AND(proccesed[0], proccesed[1], proccesed[2], proccesed[3], proccesed[4], proccesed[5]) : 
                        {Error : "No such query type"}
        
        return JSON.stringify(reqData)
    }   

    /**
    * Summary. 
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    POST(entity : Data){
        /* filter out entity with the same id, if exist */
        this.data = this.data.filter((e : Data) => e.id !== entity.id)
        this.data.push(entity)
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    EQUAL(property : string, value : string , data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => (property === "views" || property === "timestamp") ? e[property] === parseInt(value) :
                                                                                              e[property] === value)
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    GREATER_THAN(property : string, value : string, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] > parseInt(value))
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    LESS_THAN(property : string, value : string, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] < parseInt(value))
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    AND(queryType1 : string, propery1 : string, value1 : string, queryType2 : string, propery2 : string, value2 : string) : Data[]{
        let queried1 : Data[] = this.queryFunctions[queryType1](propery1, value1, this.data)
        let queried2 : Data[] = this.queryFunctions[queryType2](propery2, value2, queried1)

        return queried2
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    OR(queryType1 : string, propery1 : string, value1 : string, queryType2 : string, propery2 : string, value2 : string) : Data[]{
        let queried1 : Data[] = this.queryFunctions[queryType1](propery1, value1, this.data)
        let queried2 : Data[] = this.queryFunctions[queryType2](propery2, value2, this.data)
        let filteredQueried2 : Data[] = queried2.filter((data2 : Data) => !queried1.some((data1) => data1 === data2))

        return queried1.concat(filteredQueried2)
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description. 
    */
    NOT(queryType : string, propery : string, value : string) : Data[]{
        let queried : Data[] = this.queryFunctions[queryType](propery, value, this.data)
        
        return this.data.filter((data2 : Data) => !queried.some((data1) => data1 === data2))
    }
    
    /* PROCESSORS */

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
   process(queryType : string, query : string) : string[] {
    console.log("DataQuery: Proccesing " + queryType)
    return  queryType == "EQUAL" ? this.processEqual(query) :
            queryType == "GREATER_THAN" ? this.processLessGreaterThan(queryType, query) :
            queryType == "LESS_THAN" ? this.processLessGreaterThan(queryType, query) : 
            queryType == "NOT" ? this.processNot(query) :
            queryType == "OR" ? this.processOrAnd(queryType, query) :
            queryType == "AND" ? this.processOrAnd(queryType, query) : ["ERROR"]
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
    processEqual(query : string) : string[]{
        let regExp : RegExp = /\(([^)]+)\)/
        let parentExps : string[] = regExp.exec(query).map((exp) => exp.substring(1, exp.length - 1))
        let pair = parentExps[0].split(',')
        let property : string = pair[0]
        let value : string = this.isNumberProperty(property) ? pair[1] : pair[1].substr(1,pair[1].length - 2)

        console.log("DataQuery: EQUAL Property[" + property + "] Value[" + value + "]")

        return [property, value]
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
    processLessGreaterThan(queryType : string, query : string) : string[]{
        let regExp : RegExp = /\(([^)]+)\)/
        let parentExps : string[] = regExp.exec(query).map((exp) => exp.substring(1, exp.length - 1))
        let pair = parentExps[0].split(',')
        let property : string = pair[0]
        let value : string = this.isNumberProperty(property) ? pair[1] : pair[1].substr(1,pair[1].length - 2)

        console.log("DataQuery: " + queryType + " Property[" + property + "] Value[" + parseInt(value) + "]")

        if(!this.isNumberProperty(property) || isNaN(parseInt(value))){
            return ["ERROR: " + queryType + " query supports only numeric values"]
        }

        return [property, value] 
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
    processNot(query : string) : string[]{
        let inQueryType : string = this.getQueryType(query.substring(1, query.length - 1))
        let inQuery : string = query.substring(inQueryType.length)
        let proccesedInQuery : string[] = this.process(inQueryType, inQuery)

        return [inQueryType].concat(proccesedInQuery)
    }

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
    processOrAnd(queryType : string, query : string) : string[]{
        query = query.substring(1, query.length - 1)

        let inQueryType1 : string = this.operators[this.findFirstOperator(query)[0]]
        let inQueryType2 : string = this.operators[this.findFirstOperator(query.substring(inQueryType1.length))[0]]
        let inQueryIdx2 : number = this.findFirstOperator(query.substring(inQueryType1.length))[1] + inQueryType1.length
        let inQuery1 : string = query.substring(inQueryType1.length, inQueryIdx2 - 1)
        let inQuery2 : string = query.substring(inQueryType2.length + inQueryIdx2)

        console.log("DataQuery: " + queryType + " Query [" + query + "]")

        let proccesedInQuery1 : string[] = this.process(inQueryType1, inQuery1)
        let proccesedInQuery2 : string[] = this.process(inQueryType2, inQuery2)

        return [inQueryType1].concat(proccesedInQuery1.concat([inQueryType2].concat(proccesedInQuery2)))
    }

    /* HELPERS */

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    *  @return {type} Return value description.
    */
    isQuery : (queryType :string, rawQuery : string) => boolean =
        (queryType : string, rawQuery : string) => rawQuery.indexOf(queryType) == 0

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    *  @return {type} Return value description.
     */
    getQueryType : (rawQuery : string) => string = 
        (rawQuery : string) => this.isQuery("EQUAL", rawQuery) ? "EQUAL" :
                               this.isQuery("AND", rawQuery) ? "AND" :
                               this.isQuery("OR", rawQuery) ? "OR" :
                               this.isQuery("NOT", rawQuery) ? "NOT" :
                               this.isQuery("GREATER_THAN", rawQuery) ? "GREATER_THAN" :
                               this.isQuery("LESS_THAN", rawQuery) ? "LESS_THAN" : "ERROR"

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
    isNumberProperty = (property : string | number) => property === "views" || property === "timestamp"

    /**
    * Summary.
    * 
    * @param {very_long_type} name           Description.
    * @param {type}           very_long_name Description.
    * 
    * @return {type} Return value description.
    */
   findFirstOperator = (query : string) : number[] => {
     return this.operators.map((op, i) => [i, query.indexOf(op)])
                          .reduce((acc, curr) => (curr[1] < acc[1] && curr[1] != -1) ? curr : acc, [-1, Number.MAX_VALUE]) 
   } 



}


