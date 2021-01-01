

/* TYPES */
type Value = String | Number
type NumberProperty = "views" | "timestamp"
type StringProperty = "id" | "title" | "content"
type Property = NumberProperty | StringProperty
type Query = "EQUAL" | "AND" | "OR" | "NOT" | "GREATER_THAN" | "LESS_THAN"

interface Data{
    "id" : String
    "title" : String
    "content" : String
    "views" : Number
    "timestamp" : Number
}

class DataQuery {
    data : Data[] = []
    queryFunctions : {} = {"EQUAL" : this.EQUAL,
                           "GREATER_THAN" : this.GREATER_THAN,
                           "LESS_THAN" : this.LESS_THAN}
  
    constructor() {
    }

    /* API */
    GET(query : String){

    }   

    POST(entity : Data){
        /* filter out entity with the same id, if exist */
        this.data = this.data.filter((e : Data) => e.id !== entity.id)
        this.data.push(entity)
    }

    EQUAL(property : Property, value : Value, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] === value)
    }

    GREATER_THAN(property : NumberProperty, value : Number, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] > value)
    }

    LESS_THAN(property : NumberProperty, value : Number, data : Data[] = this.data) : Data[]{
        return data.filter((e : Data) => e[property] < value)
    }

    AND(queryType1 : Query, propery1 : Property, value1 : Value, queryType2 : Query, propery2 : Property, value2 : Value){
        let queried1 : Data[] = this.queryFunctions[queryType1](propery1, value1, this.data)
        let queried2 : Data[] = this.queryFunctions[queryType2](propery2, value2, queried1)

        return queried2
    }

    OR(queryType1 : Query, propery1 : Property, value1 : Value, queryType2 : Query, propery2 : Property, value2 : Value){
        let queried1 : Data[] = this.queryFunctions[queryType1](propery1, value1, this.data)
        let queried2 : Data[] = this.queryFunctions[queryType2](propery2, value2, this.data)
        let filteredQueried2 : Data[] = queried2.filter((data2 : Data) => !queried1.some((data1) => data1 === data2))

        return queried1.concat(filteredQueried2)
    }

    NOT(queryType : Query, propery : Property, value : Value){
        let queried : Data[] = this.queryFunctions[queryType](propery, value, this.data)
        
        return this.data.filter((data2 : Data) => !queried.some((data1) => data1 === data2))
    }


    /* HELPERS */
    

}

let dataQuery = new DataQuery()

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

console.log(dataQuery.OR("GREATER_THAN", "timestamp", 3, "LESS_THAN", "timestamp", 1))