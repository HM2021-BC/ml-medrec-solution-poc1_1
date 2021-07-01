"use strict";

const HttpStatus = require('http-status');

const responseFormat = (req, res, next) => {
    let temp = res.send;
    res.send = function() {
        let body = arguments[0];
        console.log("call",body);
        // let { status } = res;
        // arguments[0] = {code: status, data: body};
        temp.apply(this,arguments);
    }
    next();
}

module.exports = { responseFormat };