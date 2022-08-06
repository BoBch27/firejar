interface SchemaType {
    [key: string]: {
        type: string;
        required?: boolean;
        default?: any;
        validate?: any[];
        maxlength?: any[];
        minlength?: any[];
        transform?: Function;
    };
}
interface MethodType {
    beforeSave?: Function;
}
declare class Schema {
    private readonly schema;
    private readonly beforeSave?;
    constructor(schema: SchemaType, methods?: MethodType);
    validate(type: string, collection: string, data: any): Promise<object>;
}
export { SchemaType, Schema };
