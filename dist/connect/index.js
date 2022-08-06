"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.connectDB = void 0;
let projectFirestore = null;
const connectDB = (firestoreService) => projectFirestore = firestoreService;
exports.connectDB = connectDB;
const getDB = () => projectFirestore;
exports.getDB = getDB;
