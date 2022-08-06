const Types = require('../types');

interface SchemaType {
  [key: string]: {
    type: string;
    required?: boolean;
    default?: any;
    validate?: any[];
    maxlength?: any[];
    minlength?: any[],
    transform?: Function;
  };
};

interface MethodType {
  beforeSave?: Function;
};

class Schema {
  private readonly schema;
  private readonly beforeSave?;

  constructor(schema: SchemaType, methods?: MethodType) {
    this.schema = schema;

    if (methods) {
      if (methods.beforeSave) {
        this.beforeSave = methods.beforeSave;
      }
    }
  };

  public async validate(type: string, collection: string, data: any): Promise<object> {
    data = await iterateAndValidate(type, collection, this.schema, data);
    
    if (this.beforeSave) {
      await this.beforeSave(data);
    }

    return data;
  };
};

async function iterateAndValidate(type: string, collection: string, schema: any, data: any): Promise<any> {
  if (data) {
    Object.keys(data).forEach(el => {
      const key = el.includes('.') ? el.split('.').reduce((o, i)=> o[i], schema) : el;
      
      if (!schema[key]) {  
        delete data[key];
      }
    });
  }

  for (const key in (type === 'create') ? schema : data) {
    if (key.includes('.')) {
      schema[key] = key.split('.').reduce((o, i)=> o[i], schema);
    }

    if (!schema[key].type && typeof schema[key] === 'object') {
      data[key] = await iterateAndValidate(type, collection, schema[key], data[key] || { });
    }

    if (type === 'create') {
      if (schema[key].type && !Object.keys(Types).map(type => Types[type]).includes(schema[key].type)) {
        throw new Error(`Invalid type for ${key} in schema`);
      }
  
      if (schema[key].required && (!data || !data[key])) {
        throw new Error(`${key} is required`);
      }
  
      if ((schema[key].default || schema[key].default === false || schema[key].default === '' || schema[key].default === 0) && !data[key]) {
        if (typeof schema[key].default === 'function') {
          data[key] = schema[key].default();
        } else {
          data[key] = schema[key].default;
        }
      }
    }
    
    if (schema[key].type === 'string' && data && data[key] && typeof data[key] !== 'string') {
      throw new Error(`${key} must be a string`);
    }
    
    if (schema[key].type === 'number' && data && data[key] && typeof data[key] !== 'number') {
      throw new Error(`${key} must be a number`);
    }
    
    if (schema[key].type === 'boolean' && data && data[key] && typeof data[key] !== 'boolean') {
      throw new Error(`${key} must be a boolean`);
    }
    
    if (schema[key].type === 'object' && data && data[key] && typeof data[key] !== 'object') {
      throw new Error(`${key} must be an object`);
    }
    
    if (schema[key].type === 'array' && data && data[key] && !Array.isArray(data[key])) {
      throw new Error(`${key} must be an array`);
    }
    
    if (schema[key].type === 'array' && data && data[key] && Array.isArray(data[key]) && schema[key].of && !data[key].every((i: string) => (typeof i === schema[key].of))) {
      throw new Error(`${key} values must be of type "${schema[key].of}"`);
    }

    if (schema[key].validate && !Array.isArray(schema[key].validate)) {
      throw new Error(`${key}'s validate property must be an array`);
    }
    
    if (schema[key].validate && data && data[key] && !schema[key].validate[0](data[key])) {
      throw new Error(schema[key].validate[1] || `Invalid ${key} value`);
    }
    
    if (schema[key].transform && data && data[key]) {
      if (typeof schema[key].transform !== 'function') {
        throw new Error(`${key}'s transform property must be a function`);
      } else {
        data[key] = schema[key].transform(data[key]);
      }
    }

    if (schema[key].maxlength && !Array.isArray(schema[key].maxlength)) {
      throw new Error(`${key}'s maxlength property must be an array`);
    }
    
    if (schema[key].maxlength && schema[key].maxlength[0] && data && data[key] && data[key].length >= schema[key].maxlength[0]) {
      throw new Error(schema[key].maxlength[1] || `${key} must be at most ${schema[key].maxlength[0]}`);
    }
    
    if (schema[key].minlength && !Array.isArray(schema[key].minlength)) {
      throw new Error(`${key}'s minlength property must be an array`);
    }

    if (schema[key].minlength && schema[key].minlength[0] && data && (!data[key] || (data[key] && data[key].length < schema[key].minlength[0]))) {
      throw new Error(schema[key].minlength[1] || `${key} must be at least ${schema[key].minlength[0]}`);
    }
  }

  return data;
};

export { SchemaType, Schema };