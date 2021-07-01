"use strict"

const { v4: uuidv4 } = require('uuid');
const HttpStatus = require('http-status');
const inherits = require('util').inherits;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const Util = require('../common/Util');
const Message = require('./Message');
const BaseController = require('./BaseController');
const Constants = require('../common/Constants');
const onchainService = require('../services/OnchainService');
const offchainService = require('../services/OffChainService');

const ApplicationError = require('../errors/ApplicationError');
const ERROR = require('../errors/ErrorCodes');

const MedRecController = function(){
    this.init();
}

inherits(MedRecController, BaseController);

MedRecController.prototype.init = function(){}

MedRecController.prototype.register = function(req, res, next) {
    // if type is provider 
    // if type is patient
    // if type is authviewer
    let { username, password, firstName, lastName, type, email, phone, identification, description } = req.body;
    let { address, privateKey } = onchainService.createNewAddress();
    
    if(type == Constants.PROVIDER || type == Constants.PATIENT || type == Constants.AUTH_VIEWER) {}
    else throw new ApplicationError('Invalid user type', ERROR.REGISTER.USERTYPE_INVALID);

    let user  = { username, firstName, lastName, type, email, phone, identification, ethAddress: address, description};
    user = {...user, ethAddress: address, privateKey, status: Constants.USER_STATUS.Approved};
    user = Util.generateSignature(user, privateKey);

    let passHash = bcrypt.hashSync(password, salt);
    user.password = passHash;

    if(type == Constants.PATIENT) {
        
        offchainService.saveUser(user, (err, user) => {
            if(err) throw new ApplicationError('Registration is failed, please contact with admin', ERROR.SYSTEM.UNKNOWN_ERROR);

            onchainService.saveUser(user)
            .then(txHash => {
                this.log('Saved user txHash', txHash);
    
                res.send(this.generateResponse(HttpStatus.OK, new Message('Your account is created')))
            })
            .catch(err => {
                this.log("could not update user to on chain", err);
                next(new ApplicationError(err.message, ERROR.SYSTEM.UNKNOWN_ERROR));
            });
            
        });

    } else {
        user.status = Constants.USER_STATUS.Pending;
        offchainService.saveUser(user, (err, user) => {
            if(err) this.log('There is error in saving user', err);
//            this.log('User is saved', user);
        });

        res.send(this.generateResponse(HttpStatus.OK, {msg: 'Your registration is submited, please wait for approval'}))
    }
}

/**
 * Provider add new patient information before adding diagnose
 */
MedRecController.prototype.addPatient = function(req, res, next) {
    let { type, ethAddress, merkleRoot } = req.decoded;
    if(type != Constants.PROVIDER) throw new ApplicationError('Permission denied', ERROR.SYSTEM.PERMISSION_DENIED);

    let { username, password, firstName, lastName, email, phone, identification, description } = req.body;

    let { address, privateKey } = onchainService.createNewAddress();
    
    let passHash = bcrypt.hashSync(password, salt);
    let user  = { username, password: passHash, firstName, lastName, type: Constants.PATIENT , email, phone, identification, ethAddress: address, description};

    user = {...user, address: req.body.address, privateKey, status: Constants.USER_STATUS.Approved};
    offchainService.saveUser(user, (err, user) => {
        if(err) {
            this.log(err);
            next(new ApplicationError('Add patient is failed, please contact with admin', ERROR.SYSTEM.UNKNOWN_ERROR));
        }

        onchainService.saveUser(user)
        .then(txHash => {
            this.log('Saved user txHash', txHash.transactionHash);
            let retUser = {...user._doc};
            delete retUser.password;
            delete retUser._id;
            res.send(this.generateResponse(HttpStatus.OK, {message: 'Patient is created', user: retUser , txHash: txHash.transactionHash}))
        })
        .catch(err => {
            this.log("could not save user to chain", err);
            
            next(new ApplicationError(err.message, ERROR.SYSTEM.UNKNOWN_ERROR));
        });
    });
}

/**
 * Adding diagnose for a patient
 */
MedRecController.prototype.addDiagnose = function(req, res, next) {
    this.log(req.decoded);
    let { username, type, ethAddress, merkleRoot } = req.decoded;
    let { patientAddress, time, name, note } = req.body;
   
    if(type != Constants.PROVIDER) throw new ApplicationError('Permission denied', ERROR.SYSTEM.PERMISSION_DENIED);

    let diagnoseCode = uuidv4();
   
    let diagnose = {
        diagnoseCode,
        providerAddress: ethAddress,
        patientAddress,
        name,
        time,
        note
    };

    offchainService.saveDiagnose(diagnose, (err, diagnose) => {
        if(err) {
            this.log(err);
            next(new ApplicationError('Could not create new diagnose, please check with admin', ERROR.SYSTEM.UNKNOWN_ERROR));
        }

        onchainService.saveDiagnose(diagnose)
        .then(txHash => {
            this.log('Saved user txHash', txHash.transactionHash);
            res.send(this.generateResponse(HttpStatus.OK, {message: 'Diagnose is added', diagnose, txHash: txHash.transactionHash}))
        })
        .catch(err => {
            this.log("could not update user to on chain", err);
            next(new ApplicationError(err.message, ERROR.SYSTEM.UNKNOWN_ERROR));
        });
    });
}

// MedRecController.prototype.ad = function(req, res) {
//     let { username, type, ethAddress, merkleRoot } = req.decoded;
//     let { patientAddress, providerAddress, time, diagnose } = req.body;
   
//     if(type != Constants.PROVIDER) throw new ApplicationError('Permission denied', ERROR.SYSTEM.PERMISSION_DENIED);
// }

MedRecController.prototype.getDiagnoses = function(req, res, next) {
    this.log(req.decoded);

    let { username, type, ethAddress, merkleRoot } = req.decoded;
    let { patientAddress } = req.params;
    if(!(type == Constants.PROVIDER || type == Constants.AUTH_VIEWER)) throw new ApplicationError('Permission denied', ERROR.SYSTEM.PERMISSION_DENIED);

    onchainService.getDiagnose4Patient(patientAddress, ethAddress)
    .then(merkleRoots => {
        this.log(merkleRoots);
        offchainService.getDiagnoses(merkleRoots, (err, dias) => {
            if(err) {
                this.log(err);
                next(new ApplicationError('Could not get diagnose for user', ERROR.SYSTEM.UNKNOWN_ERROR));
            }

            res.send(this.generateResponse(HttpStatus.OK, dias));
        });
    })
    .catch(err => {
        this.log(err);
        next(new ApplicationError(err.message, ERROR.SYSTEM.UNKNOWN_ERROR));
    });
}

MedRecController.prototype.getDiagnosesCategory = function(req, res) {
    offchainService.getListDiagnosesCategory({}, (err, cats) => {
        if(err) res.send(this.generateResponse(HttpStatus.INTERNAL_SERVER_ERROR, {error:1, errorCode: HttpStatus[HttpStatus.INTERNAL_SERVER_ERROR], msg: 'There is error in getting user'}));
        res.send(this.generateResponse(HttpStatus.OK, cats));
    });
    
}

module.exports = MedRecController;