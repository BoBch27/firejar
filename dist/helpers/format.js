"use strict";
const format = (doc) => {
    if (!doc.exists) {
        return null;
    }
    return Object.assign({ id: doc.id }, doc.data());
};
module.exports = format;
