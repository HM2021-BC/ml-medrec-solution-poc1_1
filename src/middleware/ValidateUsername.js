"use strict";

const HttpStatus = require('http-status');

const offchainService = require("../services/OffChainService");
const Util = require("../common/Util");
const ApplicationError = require("../errors/ApplicationError");
const ERRORS = require("../errors/ErrorCodes");

let checkUser = (req, res, next) => {
    // validate username existing
    let { username } = req.body;

    if(!username || username.trim() == '') throw new ApplicationError('Username is not supplied', ERRORS.REGISTER.USERNAME_EMPTY);

    offchainService.findUserByUsername(username, (err, user) => {
        if(err || user) {
            // console.log(`[ValidateUserName] ${username} is already reseved`);
            next(new ApplicationError('Username is already used', ERRORS.REGISTER.USERNAME_EXIST));
        }

        next();
    });
};

module.exports = { checkUser }