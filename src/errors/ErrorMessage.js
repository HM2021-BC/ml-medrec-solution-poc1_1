"use strict";

const ErrorMessage = function(msg, code) {
    this.error = 1;
    this.errorCode = code;
    this.message = msg;
}

module.exports = ErrorMessage;

