const { getDB } = require('../connect');
const { Schema } = require('../schema');
const { Query } = require('../query');
const format = require('../helpers/format');

interface ValidatingOptionType {
  skipValidation?: boolean;
}

interface FormattingOptionType {
  skipFormatting?: boolean;
}

interface CreationOptionType {
  id?: string;
  skipValidation?: boolean;
  skipFormatting?: boolean;
}

class Model {
  private readonly collection;
  private readonly schema;

  constructor(collection: string, schema: typeof Schema) {
    this.collection = collection;
    this.schema = schema;
  }

  async validate(data: object): Promise<any> {
    data = await this.schema.validate('update', this.collection, data);
    return data;
  }

  async create(data: object, options?: CreationOptionType): Promise<any> {
    if (!options || !options.skipValidation) {
      data = await this.schema.validate('create', this.collection, data);
    }
    
    if (options && options.id) {
      const doc = getDB().collection(this.collection).doc(options.id);
      await doc.set(data);
      return (options && options.skipFormatting) ? doc : { id: options.id, ...data };
    }

    const doc = await getDB().collection(this.collection).add(data);
    return (options && options.skipFormatting) ? doc : { id: doc.id, ...data };
  }

  async findById(id: string, options?: FormattingOptionType): Promise<any> {
    const doc = await getDB().collection(this.collection).doc(id).get();
    return (options && options.skipFormatting) ? doc : format(doc);
  }

  find(): typeof Query {
    return new Query(this.collection, this.schema);
  }

  async updateById(id: string, data: object, options?: ValidatingOptionType): Promise<any> {
    if (!options || !options.skipValidation) {
      data = await this.schema.validate('update', this.collection, data);
    }
    await getDB().collection(this.collection).doc(id).update(data, { merge: true });
    return id;
  }

  async deleteById(id: string): Promise<any> {
    await getDB().collection(this.collection).doc(id).delete();
    return id;
  }
};

const model = (collection: string, schema: typeof Schema): Model => {
  return new Model(collection, schema);
};

export { model as Model, Schema, Query };