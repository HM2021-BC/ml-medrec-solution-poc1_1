"use strict";

const HttpStatus = require('http-status');

const Util = require("../common/Util");
const tokenService = require('../services/TokenService');
const ApplicationError = require("../errors/ApplicationError");
const ErrorCodes = require("../errors/ErrorCodes");
const ErrorMessage = require("../errors/ErrorMessage");

let errorHandler = (err, req, res, next) => {
    console.log('[ErrorHandler] There is error in processing request', err);
    if(err instanceof ApplicationError) {
        let { message, code } = err;
        return res.send({code: HttpStatus.OK, data: new ErrorMessage(message, code) });
    } 

    if (err instanceof Error) {
        let {status} = err;
        status = status?status:HttpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).send({code: status, data: new ErrorMessage('System error, please contact with admin', ErrorCodes.SYSTEM.UNKNOWN_ERROR) });
    }

    next();
};

module.exports = { errorHandler }