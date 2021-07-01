"use strict";

const inherits = require('util').inherits;

const ApplicationError = function(message, code) {
    this.message = message;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, ApplicationError);
}

inherits(ApplicationError, Error);

module.exports = ApplicationError;



