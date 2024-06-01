
type TData = string | number | boolean

type TRow = Record<string,TData>

type TTable = Record<number,TRow>

interface ParsedArgument {
  argument: string;
}

interface ParsedOperation {
  operation: string;
  argument: (ParsedArgument | ParsedOperation)[];
}

export enum EOperations {
  COUNT="COUNT"
}

class Table {

  private table: TTable 
  
  private ptr: number

  constructor() {
    this.table = {} as TTable;
    this.ptr = 0;
  }

  insert(rowVal: TRow) {
    this.table[this.ptr] = rowVal
    this.ptr += 1
  } 
    
  query(query: string): TTable{
    console.log('the query got',query)
    const queryTree = this.parseExpression(query) as ParsedOperation
    console.log(queryTree)
    switch(queryTree.operation){
      case EOperations.COUNT:
        return this.getRowCount(queryTree.argument) 
      default: break;
    }
    return [] as TTable

  }

  getRowCount(filter: ParsedOperation['argument']){
    const rows = []
    for (let i = 0; i < this.ptr;i++){
      let queryMatch = false
      filter.forEach(filterQuery => {
        const logicalRegex = /(\w+)(>*<*)(\d)/
        if(typeof filterQuery.argument === 'string'){
          const logicalMatch = filterQuery.argument.match(logicalRegex)
          if(!logicalMatch) return[]
          const [, filedName, operation, value] = logicalMatch
          switch(operation){
            case '<':
              queryMatch = this.table[i][filedName] as number < Number(value);
              break;
            case '>':
              queryMatch = this.table[i][filedName]  as number > Number(value);
              break;
            default:
              break;
          }
        }
      })
      if(queryMatch) rows.push(this.table[i])
    }
    console.table(rows)
    return [{length: rows.length}]
  }




 

  parseExpression = (expression: string): ParsedOperation | ParsedArgument =>  {

    const functionCallRegex = /(\w+)\((.*)\)/;

    let match = expression.match(functionCallRegex);

    if (match) {
      const [, operation, args] = match;
      const parsedArgs: (ParsedArgument | ParsedOperation)[] = [];

      let depth = 0;
      let startIdx = 0;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '(') {
          depth++;
        } else if (args[i] === ')') {
          depth--;
        } else if (args[i] === ',' && depth === 0) {
          parsedArgs.push(this.parseExpression(args.slice(startIdx, i).trim()));
          startIdx = i + 1;
        }
      }

      if (startIdx < args.length) {
        parsedArgs.push(this.parseExpression(args.slice(startIdx).trim()));
      }

      return {
        operation,
        argument: parsedArgs
      };
    } else {
      return { argument: expression };
    }
  }
  
  print(){
    console.table(this.table)
  }
}



const init = () => {
  console.log("init");
  const table = new Table()
  table.insert({
    name: "Batman",
    height: 6.2,
    weight: 106.6,
    power: "Rich",
    identiy: "Bruce Wayne",
  })
    table.insert({
    name: "Batman",
    height: 6.2,
    weight: 106.6,
    power: "Rich",
    identiy: "Bruce Wayne",
  })

    table.insert({
    name: "Super Man",
    height: 6.3,
    weight: 77.1,
    power: "Alien powers",
    identiy: "Clark kent",
  })
  table.insert({
    name: "The Flash",
    height: 6.0,
    weight: 88.5,
    power: "Super speed",
    identiy: "Barry Allen"
  })
  table.print()
  const query = 'COUNT(height>6.2)'
  const query2 = 'COUNT(height>5)'
  const result = table.query(query)
  console.table(result)
  const result2 = table.query(query2)
  console.table(result2)
};

init();
