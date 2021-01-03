
/* TYPES */

export interface Data{"id" : string; "title" : string; "content" : string; "views" : number; "timestamp" : number}

export class DataQuery {
    data : Data[] = []
    queryFunctions : {} = {"EQUAL" : this.EQUAL,
                           "GREATER_THAN" : this.GREATER_THAN,
                           "LESS_THAN" : this.LESS_THAN}

    /* API */
    GET(rawQuery : string) : string {
        let queryType : string = this.getQueryType(rawQuery)
        let query : string = rawQuery.substring(queryType.length)
        let regExp : RegExp = /\(([^)]+)\)/
        let matches : string[] = regExp.exec(query)

        switch(queryType){
            case "EQUAL" :
                let pair : string[] = matches[0].substring(1, matches[0].length - 1).split(',') 
                let property : string = pair[0]
                let value : string = this.isNumberProperty(property) ? pair[1] : pair[1].substr(1,pair[1].length - 2)

                console.log("DataQuery: EQUAL Property[" + property + "] Value[" + value + "]")

                return JSON.stringify(this.EQUAL(property, value))

            case "AND" :
                
                break; 
            
            case "OR" :
                
                break; 
                
            case "NOT" :
                
                break; 

            case "GREATER_THAN" :
                
                break; 

            case "LESS_THAN" :
                
                break; 

            case "ERROR" :
                return "ERROR"
                break;     
        }

        return "ERROR"
    }

    POST(entity : Data){
        /* filter out entity with the same id, if exist */
        this.data = this.data.filter((e : Data) => e.id !== entity.id)
        this.data.push(entity)
    }

    EQUAL(property : string, value : string | number, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] === value)
    }

    GREATER_THAN(property : string, value : Number, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] > value)
    }

    LESS_THAN(property : string, value : Number, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] < value)
    }

    AND(queryType1 : string, propery1 : string, value1 : string | number, queryType2 : string, propery2 : string, value2 : string | number) : Data[]{
        let queried1 : Data[] = this.queryFunctions[queryType1](propery1, value1, this.data)
        let queried2 : Data[] = this.queryFunctions[queryType2](propery2, value2, queried1)

        return queried2
    }

    OR(queryType1 : string, propery1 : string, value1 : string | number, queryType2 : string, propery2 : string, value2 : string | number) : Data[]{
        let queried1 : Data[] = this.queryFunctions[queryType1](propery1, value1, this.data)
        let queried2 : Data[] = this.queryFunctions[queryType2](propery2, value2, this.data)
        let filteredQueried2 : Data[] = queried2.filter((data2 : Data) => !queried1.some((data1) => data1 === data2))

        return queried1.concat(filteredQueried2)
    }

    NOT(queryType : string, propery : string, value : string | number) : Data[]{
        let queried : Data[] = this.queryFunctions[queryType](propery, value, this.data)
        
        return this.data.filter((data2 : Data) => !queried.some((data1) => data1 === data2))
    }    


    /* HELPERS */
    isQuery : (queryType :string, rawQuery : string) => boolean =
        (queryType : string, rawQuery : string) => rawQuery.indexOf(queryType) == 0

    getQueryType : (rawQuery : string) => string = 
        (rawQuery : string) => this.isQuery("EQUAL", rawQuery) ? "EQUAL" :
                               this.isQuery("AND", rawQuery) ? "AND" :
                               this.isQuery("OR", rawQuery) ? "OR" :
                               this.isQuery("NOT", rawQuery) ? "NOT" :
                               this.isQuery("GREATER_THAN", rawQuery) ? "GREATER_THAN" :
                               this.isQuery("LESS_THAN", rawQuery) ? "LESS_THAN" : "ERROR"

    isNumberProperty = (property : string | number) => property === "views" || property === "timestamp"

}


