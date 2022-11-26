"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.Query = void 0;
const { getDB } = require('../connect');
const { Schema } = require('../schema');
exports.Schema = Schema;
const format = require('../helpers/format');
class Query {
    constructor(collection, schema) {
        this.conditions = [];
        this.orderType = 'asc';
        this.collection = collection;
        this.schema = schema;
    }
    where(field, operator, value) {
        this.conditions.push({ field, operator, value });
        return this;
    }
    orderBy(field, type) {
        this.orderByField = field;
        this.orderType = type;
        return this;
    }
    limit(limitTo) {
        this.limitTo = limitTo;
        return this;
    }
    limitToLast(limitFrom) {
        this.limitFrom = limitFrom;
        return this;
    }
    startAfter(startItem) {
        this.startItem = startItem;
        return this;
    }
    endBefore(endItem) {
        this.endItem = endItem;
        return this;
    }
    offset(offsetTo) {
        this.offsetTo = offsetTo;
        return this;
    }
    execute(options) {
        return __awaiter(this, void 0, void 0, function* () {
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
            if (this.limitFrom) {
                query = query.limitToLast(this.limitFrom);
            }
            if (this.startItem) {
                query = query.startAfter(this.startItem);
            }
            if (this.endItem) {
                query = query.endBefore(this.endItem);
            }
            if (this.offsetTo) {
                query = query.offset(this.offsetTo);
            }
            const docs = yield query.get();
            if (options && options.skipFormatting) {
                return docs;
            }
            else {
                let data = docs.docs.map((doc) => {
                    return format(doc);
                });
                return data;
            }
        });
    }
}
exports.Query = Query;
;
