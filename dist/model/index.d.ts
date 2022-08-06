declare const Schema: any;
declare const Query: any;
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
declare class Model {
    private readonly collection;
    private readonly schema;
    constructor(collection: string, schema: typeof Schema);
    validate(data: object): Promise<any>;
    create(data: object, options?: CreationOptionType): Promise<any>;
    findById(id: string, options?: FormattingOptionType): Promise<any>;
    find(): typeof Query;
    updateById(id: string, data: object, options?: ValidatingOptionType): Promise<any>;
    deleteById(id: string): Promise<any>;
}
declare const model: (collection: string, schema: typeof Schema) => Model;
export { model as Model, Schema, Query };
