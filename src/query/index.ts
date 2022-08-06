const { getDB } = require('../connect');
const { Schema } = require('../schema');
const format = require('../helpers/format');

interface QueryType {
  field: string;
  operator: string;
  value: any;
}

interface OptionType {
  skipFormatting?: boolean;
}

class Query {
  private conditions: QueryType[] = [];
  private readonly collection: string;
  private readonly schema: typeof Schema;
  private orderByField?: string;
  private orderType: string = 'asc';
  private limitTo?: number;
  private offsetTo?: number;
  
  constructor(collection: string, schema: typeof Schema) {
    this.collection = collection;
    this.schema = schema;
  }

  where(field: string, operator: string, value: any): Query {
    this.conditions.push({ field, operator, value });
    return this;
  }

  orderBy(field: string, type: string): Query {
    this.orderByField = field;
    this.orderType = type;
    return this;
  }

  limit(limitTo: number): Query {
    this.limitTo = limitTo;
    return this;
  }

  offset(offsetTo: number): Query {
    this.offsetTo = offsetTo;
    return this;
  }

  async execute(options?: OptionType): Promise<any> {
    let query = getDB().collection(this.collection);

    this.conditions.forEach(condition => {
      query = query.where(condition.field, condition.operator, condition.value);
    });

    if (this.orderByField) {
      query = query.orderBy(this.orderByField, this.orderType);
    }

    if (this.limitTo) {
      query = query.limit(this.limitTo);
    }

    if (this.offsetTo) {
      query = query.offset(this.offsetTo);
    }

    const docs = await query.get();

    if (options && options.skipFormatting) {
      return docs;
    } else {
      let data = docs.docs.map((doc: any) => {
        return format(doc);
      });
      
      return data;
    }
  }
};

export { QueryType, Query, Schema };