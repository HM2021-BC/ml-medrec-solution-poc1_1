"use strict"

const { v4: uuidv4 } = require('uuid');
const HttpStatus = require('http-status');
const inherits = require('util').inherits;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const Message = require('./Message');
const BaseController = require('./BaseController');
const Constants = require('../common/Constants');
const onchainService = require('../services/OnchainService');
const offchainService = require('../services/OffChainService');

const ApplicationError = require('../errors/ApplicationError');
const ERROR = require('../errors/ErrorCodes');

const Covid19TestController = function(){
    this.init();
}

inherits(Covid19TestController, BaseController);

Covid19TestController.prototype.init = function(){
    
}

/**
 * Adding diagnose for a patient
 */
Covid19TestController.prototype.addCovidTest = function(req, res, next) {
    let { username, type, ethAddress, merkleRoot } = req.decoded;
    let { diagnoseMerkleRoot, patientAddress, time, rt_qpcr, igm, igg, note } = req.body;
   
    if(type != Constants.PROVIDER) throw new ApplicationError('Permission denied', ERROR.SYSTEM.PERMISSION_DENIED);

    // let testCode = uuidv4();
   
    let diagoseTest = {
        diagnoseMerkleRoot,
        providerAddress: ethAddress,
        patientAddress,
        time,
        rt_qpcr,
        igm,
        igg,
        note
    };

    offchainService.saveDiagnoseTest(diagoseTest, (err, diagoseTest) => {
        if(err) {
            this.log(err);
            next(new ApplicationError('Saved diagnose test failed, please contact with admin', ERROR.SYSTEM.UNKNOWN_ERROR));
        }

        onchainService.saveDiagnoseTest(diagoseTest)
        .then(txHash => {
            this.log('Saved user txHash', txHash);
            res.send(this.generateResponse(HttpStatus.OK, {message: 'DiagnoseTest is saved', diagoseTest, txHash: txHash.transactionHash}))
        })
        .catch(err => {
            this.log("Saved data on blockchain failed", err);
            next(new ApplicationError(err.message, ERROR.SYSTEM.UNKNOWN_ERROR));
        });
    });
}

Covid19TestController.prototype.getCovidTests = function(req, res, next) {

    let { username, type, ethAddress, merkleRoot } = req.decoded;
    let { diagnoseMerkleRoot } = req.params;
    if(!(type == Constants.PROVIDER || type == Constants.AUTH_VIEWER)) throw new ApplicationError('Permission denied', ERROR.SYSTEM.PERMISSION_DENIED);

    onchainService.getDiagnoseTest(diagnoseMerkleRoot, ethAddress)
    .then(diagnoseTestMerkelRoot => {
        this.log(diagnoseTestMerkelRoot);
        offchainService.getDiagnoseTest(diagnoseTestMerkelRoot, (err, dias) => {
            if(err) {
                this.log(err);
                next(new ApplicationError('Could not get diagnose test for user', ERROR.SYSTEM.UNKNOWN_ERROR));
            }

            res.send(this.generateResponse(HttpStatus.OK, dias));
        });
    })
    .catch(err => {
        this.log(err);
        next(new ApplicationError(err.message, ERROR.SYSTEM.UNKNOWN_ERROR));
    });
}

module.exports = Covid19TestController;