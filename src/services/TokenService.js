"use strict";

const { v4: uuidv4 } = require('uuid');
const _ = require("lodash");
const inherits = require('util').inherits;
const jwt = require('jsonwebtoken');

const Base = require('../common/Base');
const Util = require('../common/Util');

const TokenService = function() {

    this.init();
}

inherits(TokenService, Base);

TokenService.prototype.init = function() {
    this.secretKey = '12345678990'//Util.base64encode(uuidv4());
    this.log(this.secretKey);
}

TokenService.prototype.saveToken = async function(token, user) {
    this.tokens.set(token, user);
}

TokenService.prototype.generateToken = function(payload) {
    let token = Util.generateJWT(payload, this.secretKey);

    return token;
}

TokenService.prototype.verifyToken = function(token) {
    this.log("Verify token", token);
    token = Util.base64decode(token);
    
    // invalid token - synchronous
    return jwt.verify(token, this.secretKey);
}

// Singleton Service
module.exports = new TokenService();