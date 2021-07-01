"use strict"

const Web3 = require("web3");
const inherits = require('util').inherits;
const _ = require('lodash');

const Base = require('../common/Base');
const Config = require("../common/Config");
const keyStoreService = require("./KeyStorageService");

//never change it, if not could not access old account
const DEFAULT_PASS = 'mecrec_defaultpass';

const ETH = function() {
    this.web3 = new Web3(new Web3.providers.HttpProvider(Config.RPC_URL));
    this.masterAccount = this.getAccount(Config.MASTER_ETH_ACCOUNT);
    this.gasPrice = this.web3.utils.toWei("1", "gwei");
}

inherits(ETH, Base);

ETH.prototype.init = function() {}

ETH.prototype.getMasterAccount = function() {
    return this.masterAccount;
}
ETH.prototype.getAccount = function(privateKey) {
    return this.web3.eth.accounts.privateKeyToAccount(privateKey);
}

ETH.prototype.addressToAccount = async function(address) {
    let keystore = await keyStoreService.getKeyStore(address);
    return this.getAccountFromKeyStore(keystore);
}

ETH.prototype.getAccountFromKeyStore = function(keystore) {
    // this.log(keystore);
    return this.web3.eth.accounts.decrypt(keystore, DEFAULT_PASS);
}

ETH.prototype.createAccount = function () {
    this.log('Generate new account');

    let { address, privateKey } = this.web3.eth.accounts.create();
    let keystore = this.generateKeystore(privateKey, DEFAULT_PASS);

    keyStoreService.save({address}, keystore);
    return { address, privateKey };
}

ETH.prototype.generateKeystore = function (privateKey) {
    return this.web3.eth.accounts.encrypt(privateKey, DEFAULT_PASS);
}

ETH.prototype.transfer = function({from, to, amount}) {
    let {address, privateKey} = this.masterAccount;
    if(address.toLowerCase() == from.toLowerCase()){
        this.funding(to, amount);
    }

    let keystore = keyStoreService.getKeystore(from);
}

ETH.prototype.funding = async function(to, amount) {
    if(!this.web3.utils.isAddress(to)) throw new Error('Invalid to address');
    if(!_.isNumber(amount)) throw new Error("Invalid funding amount");

    let {address, privateKey} = this.masterAccount;
    let nonce = await this.web3.eth.getTransactionCount(address);

    let tx = {
        from: address,
        to,
        value: this.web3.utils.toWei(""+amount, 'ether'),
        nonce,
        gasPrice: this.gasPrice,
        gas: 50000
    };

    let { rawTransaction, transactionHash } = await this.masterAccount.signTransaction(tx);
    let receipt = await this.web3.eth.sendSignedTransaction(rawTransaction);
    
    return Promise.resolve(receipt);
}

ETH.prototype.sign = function(data, key) {
    return this.web3.eth.accounts.sign(data, key);
}

module.exports = new ETH();