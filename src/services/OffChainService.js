"use strict";

const _ = require("lodash");
const inherits = require('util').inherits;
const Base = require('../common/Base');
const Util = require("../common/Util");

const UserModel = require("../models/User");
const DiagnoseModel = require("../models/Diagnose");
const CovidTestResultModel = require("../models/CovidTestResult");
const DiagnoseCategoryModel = require("../models/DiagnoseCategory");
const ApplicationError = require("../errors/ApplicationError");


const OffChainService = function() {

}

inherits(OffChainService, Base);

OffChainService.prototype.init = function() {

}

OffChainService.prototype.saveDiagnoseCategory = function(diagnoseCat, cb) {
    let {code} = diagnoseCat;
    let query = DiagnoseCategoryModel.findOne({ code });
    query.exec((err, _diagnoseCat) => {
        if(_diagnoseCat || err) {
            cb(new Error('Diagnose category is exited, IGNORE'), _diagnoseCat);
            return;
        }
        
        DiagnoseCategoryModel.create(diagnoseCat, (err, diagnoseCat) => cb(err, diagnoseCat));
    });
}

OffChainService.prototype.saveDiagnose = function(diagnose, cb) {
    let { diagnoseCode, providerAddress, patientAddress, name, time, note } = diagnose;
    let fArray = _.flattenDepth(Util.objectToArray({diagnoseCode, providerAddress, patientAddress, name, time, note}));
    let merkleRoot = Util.createMerkleRoot(fArray);

    diagnose.merkleRoot = "0x"+merkleRoot;

    this.log(diagnose);

    DiagnoseModel.create(diagnose, (err, diagnose) => cb(err, diagnose));
}

OffChainService.prototype.saveDiagnoseTest = function(diagnoseResult, cb) {
    let fArray = _.flattenDepth(Util.objectToArray(diagnoseResult));
    let merkleRoot = Util.createMerkleRoot(fArray);

    diagnoseResult.merkleRoot = "0x"+merkleRoot;

    this.log(diagnoseResult);

    CovidTestResultModel.create(diagnoseResult, (err, covidResult) => cb(err, covidResult));
}

OffChainService.prototype.saveUser = function(user, cb) {
    if (!user) throw new Error('Missing user');
    let query = {username: user.username};
    UserModel.create(user, (err, user) => cb(err, user));    
}

OffChainService.prototype.updateUser = function(user, cb) {
    if (!user)
        throw new Error('Missing user');
    
    let { username, status } = user;

    const filter = { username };
    const update = { status };
    UserModel.findOneAndUpdate(filter, update, (err, user) => cb(err, user));
}

OffChainService.prototype.savePatient = function () {

}

OffChainService.prototype.saveProvider = function () {

}

OffChainService.prototype.saveAuthViewer = function () {

}

OffChainService.prototype.findUsers = function(obj, cb) {
    let query = UserModel.find(obj);
    return query.exec(cb);
}

OffChainService.prototype.getListDiagnosesCategory = function(obj, cb) {
    let query = DiagnoseCategoryModel.find(obj);
    return query.exec(cb);
}

OffChainService.prototype.getDiagnoses = function(merketRoots = [], cb) {
    if(!merketRoots) return [];

    let query = DiagnoseModel.find({merkleRoot: { "$in" : merketRoots}});
    return query.exec(cb);
}

OffChainService.prototype.getDiagnoseTest = function(merketRoot, cb) {
    if(!merketRoot) return {};

    let query = CovidTestResultModel.findOne({merkleRoot: { "$in" : merketRoot}});
    return query.exec(cb);
}



OffChainService.prototype.findUserByUsername = function(username, cb) {
    let query = UserModel.findOne({ username });
    query.exec(cb);
}




// submit transaction
// control fund for subaccount


// Singleton Service
module.exports = new OffChainService();