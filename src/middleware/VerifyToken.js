"use strict";

const HttpStatus = require('http-status');

const Util = require("../common/Util");
const tokenService = require('../services/TokenService');
const ApplicationError = require("../errors/ApplicationError");
const ERRORS = require("../errors/ErrorCodes");

let checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase

    if (!token || token.trim() == '') throw new ApplicationError('Bearer token is not supplied', ERRORS.LOGIN.TOKEN_EMPTY);
        
    // remove header Bearer 
    try {
        token = token.slice(7, token.length);
        let decoded = tokenService.verifyToken(token);
        req.decoded = decoded;
        next();
    } catch(error) {
        console.log("Token verify failed", error.message);
        next(new ApplicationError('Token is invalid', ERRORS.LOGIN.TOKEN_INVALID))
    }
};

module.exports = { checkToken }