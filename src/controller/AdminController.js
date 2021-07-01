"use strict"

const HttpStatus = require('http-status');
const inherits = require('util').inherits;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const BaseController = require('./BaseController');
const Constants = require('../common/Constants');
const onchainService = require('../services/OnchainService');
const offchainService = require('../services/OffChainService');


const AdminController = function(){
    this.init();
}

inherits(AdminController, BaseController);

AdminController.prototype.init = function(){
    require("./SetupMasterData");
    // let user = {username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'Admin', 
    //     type: 'Admin', identification: 'Admin', status: Constants.USER_STATUS.Approved,
    //     email: 'admin@morpheuslabs.io', description: 'Morpheuslabs Admin'
    // };

    // user.password = bcrypt.hashSync(user.password, salt);

    // offchainService.saveUser(user, (err, user) => {
    //     if(err) this.log('There is error in saving user', err);
    //     this.log('Inited default admin (admin/admin)');
    // });
}

AdminController.prototype.approveUser = function(req, res) {
    let { type } = req.decoded;
    let { username } = req.body;

    if(!username || username.strim == '') {
        res.send(this.generateResponse(HttpStatus.OK, { error:1, errorCode: HttpStatus.BAD_REQUEST,  msg: 'Invalid username'}));
        return;
    }

    if(type != Constants.ADMIN) {
        res.send(this.generateResponse(HttpStatus.UNAUTHORIZED, { error:1, errorCode: HttpStatus.UNAUTHORIZED,  msg: 'Permission denied'}));
        return;
    }

    offchainService.findUserByUsername(username, (err, user) => {
        if(err || !user) {
            this.log("User not found", user);
            res.send(this.generateResponse(HttpStatus.OK, { error:1, errorCode: HttpStatus.NOT_FOUND,  msg: 'Provider not found'}));
            return;
        }
        this.log("Provider info", user);
        user.status = Constants.USER_STATUS.Approved;
        onchainService.saveUser(user)
        .then((result) => {
            offchainService.updateUser(user, (err, user) => {
                if(err) this.log('There is error in saving user', err);
                this.log(`Provider ${user.username} is approved`);
            });
            res.send(this.generateResponse(HttpStatus.OK, { msg: 'User is approved'}));
        })
        .catch(err => {
            this.log(err);
            res.send(this.generateResponse(HttpStatus.OK, { error:1, errorCode: HttpStatus.INTERNAL_SERVER_ERROR,  msg: 'Could not approve for provider'}));
            return;
        });
    });
}

AdminController.prototype.addProvider = function(req, res) {
    let { username, type, ethAddress, merkleRoot } = req.decoded;
    this.log(req.decoded);
}

AdminController.prototype.addAuthInstitute = function(req, res) {
    let {username, type, ethAddress, merkleRoot} = req.decoded;
    this.log(req.decoded);
}

AdminController.prototype.getProviders = function(req, res) {
    let status = req.query.status;

    if (isNaN(status)) {
        res.send(this.generateResponse(HttpStatus.BAD_REQUEST, {error: 1, errorCode: HttpStatus[HttpStatus.BAD_REQUEST], msg: 'Invalid parameter'}));
        return;
    }

    let query = status ? {status, type: Constants.PROVIDER} : {type: Constants.PROVIDER};

    offchainService.findUsers(query, (err, users) => {
        if(err) res.send(this.generateResponse(HttpStatus.INTERNAL_SERVER_ERROR, {error:1, errorCode: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR], msg: 'There is error in getting user'}));
        
        if(!users) return [];

        let resUsers = users.map(user => {
            let {id, username, firstName, lastName, type, email, phone, status, ethAddress, description, merkleRoot} = user;
            return {id, username, firstName, lastName, type, email, phone, status, ethAddress, description, merkleRoot};
        });

        res.send(this.generateResponse(HttpStatus.OK, resUsers));
    });
}

AdminController.prototype.getAuthenInstitutes = function(req, res) {
    let status = req.query.status;
    let query = status? {status, type: Constants.AUTH_VIEWER}: {type: Constants.AUTH_VIEWER};

    offchainService.findUsers(query, (err, users) => {
        if(err) res.send(this.generateResponse(HttpStatus.INTERNAL_SERVER_ERROR, {error:1, errorCode: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR], msg: 'There is error in getting user'}));

        let resUsers = users.map(user => {
            let {id, username, firstName, lastName, type, email, phone, ethAddress, description} = user;
            return {id, username, firstName, lastName, type, email, phone, ethAddress, description};
        });

        res.send(this.generateResponse(HttpStatus.OK, resUsers));
    });
    
}

module.exports = AdminController;