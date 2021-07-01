"use strict"

const Web3 = require("web3");
const inherits = require('util').inherits;
const Base = require('../common/Base');
const Config = require('../common/Config');
const ETH = require('./ETH');

const MedRecProxyContract = function(){
    this.web3 = new Web3(new Web3.providers.HttpProvider(Config.RPC_URL));
    this.masterAccount = ETH.getAccount(Config.MASTER_ETH_ACCOUNT);
    this.masterAddress = this.masterAccount.address;
    this.gasPrice = this.web3.utils.toWei("1", "gwei");
    this.minETH = this.web3.utils.toWei("0.01", "ether");
    this.medrecProxyAddress = Config.MEDREC_PROXY_ADDRESS;
    this.medrecProxyAbi = Config.MEDREC_PROXY_ABI;

    this.init();
}

inherits(MedRecProxyContract, Base);

MedRecProxyContract.prototype.init = function () {
    this.contract = new this.web3.eth.Contract(this.medrecProxyAbi, this.medrecProxyAddress);
}

MedRecProxyContract.prototype.addPatient = async function({ senderAddress, patientAddress, patientMerkleRoot}) {
    this.log("Add patient", senderAddress, patientAddress, patientMerkleRoot);
    let account = senderAddress.toLowerCase() == this.masterAddress.toLowerCase()? this.masterAccount: ETH.addressToAccount(senderAddress);
    
    if(!account) throw new Error('Invalid sender');

    let balance =  await this.web3.eth.getBalance(senderAddress);
    if(balance < this.minETH) throw new Error("Insufficient fund");

    let payload = this.contract.methods.addNewPatient(patientAddress, `0x${patientMerkleRoot}`).encodeABI();
    let nonce = await this.web3.eth.getTransactionCount(senderAddress, 'pending');

    let tx = {
        from: senderAddress,
        to: this.medrecProxyAddress,
        gas: 500000,
        gasPrice: this.gasPrice,
        nonce,
        data: payload
    }

    const signedTX = await account.signTransaction(tx);
    const txReceipt = await this.web3.eth.sendSignedTransaction(signedTX.rawTransaction);
    return txReceipt;
}

MedRecProxyContract.prototype.addNewProvider = async function({address, providerMerkleRoot}) {
    let payload = this.contract.methods.addNewProvider(address, providerMerkleRoot).encodeABI();
    let nonce = await this.web3.eth.getTransactionCount(this.masterAccount.address, 'pending');

    let tx = {
        from: this.masterAccount.address,
        to: this.medrecProxyAddress,
        gas: 500000,
        gasPrice: this.gasPrice,
        nonce,
        data: payload
    }

    const signedTX = await this.masterAccount.signTransaction(tx);
    const txReceipt = await this.web3.eth.sendSignedTransaction(signedTX.rawTransaction);
    return txReceipt;
}

MedRecProxyContract.prototype.registerAuthViewer = async function(address) {
    let payload = this.contract.methods.registerAuthViewer(address).encodeABI();
    let nonce = await this.web3.eth.getTransactionCount(this.masterAccount.address, 'pending');
    
    let tx = {
        from: this.masterAccount.address,
        to: this.medrecProxyAddress,
        gas: 500000,
        gasPrice: this.gasPrice,
        nonce,
        data: payload
    }

    const signedTX = await this.masterAccount.signTransaction(tx);
    const txReceipt = await this.web3.eth.sendSignedTransaction(signedTX.rawTransaction);
    return txReceipt;
}

MedRecProxyContract.prototype.addNewDiagnose = async function({address, diagnoseMerkleRoot, sender}) {
    let payload = this.contract.methods.addNewDiagnose(address, diagnoseMerkleRoot).encodeABI();
    let account = await ETH.addressToAccount(sender);
    let nonce = await this.web3.eth.getTransactionCount(sender, 'pending');

    let tx = {
        from: account.address,
        to: this.medrecProxyAddress,
        gas: 500000,
        gasPrice: this.gasPrice,
        nonce,
        data: payload
    }

    const signedTX = await account.signTransaction(tx);
    const txReceipt = await this.web3.eth.sendSignedTransaction(signedTX.rawTransaction);
    return txReceipt;
}

MedRecProxyContract.prototype.addDiagnoseTest = async function(diagnoseMerkleRoot, diagnoseTestMerkleRoot, sender) {
    this.log(arguments);
    let payload = this.contract.methods.addDiagnoseTestResult(diagnoseMerkleRoot, diagnoseTestMerkleRoot).encodeABI();
    let account = await ETH.addressToAccount(sender);
    let nonce = await this.web3.eth.getTransactionCount(sender, 'pending');

    let tx = {
        from: account.address,
        to: this.medrecProxyAddress,
        gas: 500000,
        gasPrice: this.gasPrice,
        nonce,
        data: payload
    }

    const signedTX = await account.signTransaction(tx);
    const txReceipt = await this.web3.eth.sendSignedTransaction(signedTX.rawTransaction);
    return txReceipt;
}

MedRecProxyContract.prototype.getDiagnose4Patient = async function(address, sender) {
    return await this.contract.methods.getDiagnose4Patient(address).call({from:sender});
}

MedRecProxyContract.prototype.getDiagnoseTest = async function(diagnoseId, sender) {
    return await this.contract.methods.getDiagnoseTest(diagnoseId).call({from:sender});
}

module.exports = MedRecProxyContract;