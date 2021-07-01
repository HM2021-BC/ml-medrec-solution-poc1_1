"use strict"

const { v4: uuidv4 } = require('uuid');
const HttpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const inherits = require('util').inherits;
const BaseController = require('./BaseController');
const Constants = require('../common/Constants');
const Util = require('../common/Util');

const offChainService = require('../services/OffChainService');
const tokenService = require('../services/TokenService');

const LoginController = function(){
    this.init();
}

inherits(LoginController, BaseController);

LoginController.prototype.init = function(){
}

LoginController.prototype.signin = function(req, res) {
    // this.log("Login request", req.body);
    // let { username, password } = ;
    offChainService.findUserByUsername(req.body.username, (err, user) => {
        if(err || !user) {
            this.log("User not found", user);
            res.send(this.generateResponse(HttpStatus.OK, { error:1, errorCode: HttpStatus.UNAUTHORIZED,  msg: 'Invalid username or password'}))
            return;
        }

        if(user.status != Constants.USER_STATUS.Approved) {
            res.send(this.generateResponse(HttpStatus.OK, { error:1, errorCode: HttpStatus.UNAUTHORIZED,  msg: 'Your account is not active yet, please contact with admin'}))
            return;
        }

        let {username, password, ethAddress, type, merkleRoot} = user;
        if(!bcrypt.compareSync(req.body.password, password)) {
            res.send(this.generateResponse(HttpStatus.OK, { error: 1, errorCode: HttpStatus.UNAUTHORIZED,  msg: 'Invalid username or password'}));
            return;
        }

        let payload = JSON.stringify({username, ethAddress, type, merkleRoot});
        this.log("Payload", payload);
        let token = tokenService.generateToken(payload);
        res.send(this.generateResponse(HttpStatus.OK, {token}));
    });
}

LoginController.prototype.addProvider = function(req, res) {
}

LoginController.prototype.addAuthInstitute = function(req, res) {

}

LoginController.prototype.addPatient = function(req, res) {

}

module.exports = LoginController;