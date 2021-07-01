"use strict";

const inherits = require('util').inherits;

const MedRecProxy = require("../blockchain/MedRecProxyContract");
const ETH = require("../blockchain/ETH");
const Base = require('../common/Base');
const Constants = require('../common/Constants');
const DEFAULT_FUNDING = 0.1;

const OnchainService = function() {
    this.init();

}
inherits(OnchainService, Base);

OnchainService.prototype.init = function() {
    this.medrecProxy = new MedRecProxy();
}

OnchainService.prototype.createNewAddress = function() {
    return ETH.createAccount();
}

OnchainService.prototype.saveUser = async function(user) {
    let { type } = user;

    if(type == Constants.PATIENT)
        return this.addPatient(user);
    else if (type == Constants.PROVIDER) 
        return this.addProvider(user);
    else if (type == Constants.AUTH_VIEWER)
        return this.addAuthViewer(user);
    else 
        throw new Error('Invalid user type');
}

OnchainService.prototype.saveDiagnose = async function(diagnose) {
    let { providerAddress, patientAddress, merkleRoot } = diagnose;

    return this.medrecProxy.addNewDiagnose({address: patientAddress, diagnoseMerkleRoot: merkleRoot, sender: providerAddress});
}

OnchainService.prototype.saveDiagnoseTest = async function(diagnoseResult) {
    let { providerAddress, diagnoseMerkleRoot, merkleRoot } = diagnoseResult;
    return this.medrecProxy.addDiagnoseTest(diagnoseMerkleRoot, merkleRoot, providerAddress);
}

OnchainService.prototype.addPatient = async function (user) {
    let {address} = ETH.getMasterAccount();
    let {ethAddress, merkleRoot} = user;
    
    return this.medrecProxy.addPatient( {senderAddress: address, patientAddress: ethAddress, patientMerkleRoot: merkleRoot} );
}

OnchainService.prototype.addProvider = async function (user) {
    let { ethAddress, merkleRoot } = user;
    let txReceipt = await this.medrecProxy.addNewProvider({address: ethAddress, providerMerkleRoot: "0x"+merkleRoot});
    this.log("tx Add provider", txReceipt.transactionHash);

    let txHash = await ETH.funding(ethAddress, DEFAULT_FUNDING);
    this.log("txTransfer", txHash.transactionHash);

    return Promise.resolve("Success");
}

OnchainService.prototype.addAuthViewer = async function (user) {
    let { ethAddress, merkleRoot } = user;
    let txReceipt = await this.medrecProxy.registerAuthViewer(ethAddress);
    this.log("txAdd", txReceipt.transactionHash);

    return Promise.resolve("Success");
}

OnchainService.prototype.getDiagnose4Patient = async function(address, sender) {
    return this.medrecProxy.getDiagnose4Patient(address, sender);
}

OnchainService.prototype.getDiagnoseTest = async function(diagnoseId, sender) {
    return this.medrecProxy.getDiagnoseTest(diagnoseId, sender);
}

OnchainService.prototype.sign = function(data, key) {
    let message  = data instanceof String?data: JSON.stringify(data);
    return ETH.sign(message, key)
}


// Singleton Service
module.exports = new OnchainService();