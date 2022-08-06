declare const Schema: any;
interface QueryType {
    field: string;
    operator: string;
    value: any;
}
interface OptionType {
    skipFormatting?: boolean;
}
declare class Query {
    private conditions;
    private readonly collection;
    private readonly schema;
    private orderByField?;
    private orderType;
    private limitTo?;
    private offsetTo?;
    constructor(collection: string, schema: typeof Schema);
    where(field: string, operator: string, value: any): Query;
    orderBy(field: string, type: string): Query;
    limit(limitTo: number): Query;
    offset(offsetTo: number): Query;
    execute(options?: OptionType): Promise<any>;
}
export { QueryType, Query, Schema };
