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
exports.Query = exports.Schema = exports.Model = void 0;
const { getDB } = require('../connect');
const { Schema } = require('../schema');
exports.Schema = Schema;
const { Query } = require('../query');
exports.Query = Query;
const format = require('../helpers/format');
class Model {
    constructor(collection, schema) {
        this.collection = collection;
        this.schema = schema;
    }
    validate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            data = yield this.schema.validate('update', this.collection, data);
            return data;
        });
    }
    create(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options || !options.skipValidation) {
                data = yield this.schema.validate('create', this.collection, data);
            }
            if (options && options.id) {
                const doc = getDB().collection(this.collection).doc(options.id);
                yield doc.set(data);
                return (options && options.skipFormatting) ? doc : Object.assign({ id: options.id }, data);
            }
            const doc = yield getDB().collection(this.collection).add(data);
            return (options && options.skipFormatting) ? doc : Object.assign({ id: doc.id }, data);
        });
    }
    findById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const doc = yield getDB().collection(this.collection).doc(id).get();
            return (options && options.skipFormatting) ? doc : format(doc);
        });
    }
    find() {
        return new Query(this.collection, this.schema);
    }
    updateById(id, data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!options || !options.skipValidation) {
                data = yield this.schema.validate('update', this.collection, data);
            }
            yield getDB().collection(this.collection).doc(id).update(data, { merge: true });
            return id;
        });
    }
    deleteById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield getDB().collection(this.collection).doc(id).delete();
            return id;
        });
    }
}
;
const model = (collection, schema) => {
    return new Model(collection, schema);
};
exports.Model = model;
