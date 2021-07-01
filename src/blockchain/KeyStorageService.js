"use strict"

const { inherits, promisify } = require('util');
const fs = require('fs');
const readdir = promisify(fs.readdir);
const Base = require("../common/Base");
const ERROR = require("../errors/ErrorCodes");
const ApplicationError = require("../errors/ApplicationError");
const Config = require('../common/Config');


const KeyStorageService = function() {
    this.keyStorePath = Config.KEYSTORE_PATH;
    this.keystoreMap = new Map();
}

inherits(KeyStorageService, Base);

KeyStorageService.prototype.init = function() {

}

KeyStorageService.prototype.save = function(account, keystore) {
    let date = new Date();
    fs.writeFileSync(`${this.keyStorePath}/UTC--${date.toISOString()}--${account.address.toLowerCase()}`, JSON.stringify(keystore));
}

KeyStorageService.prototype._checkKeyStore = function(_file, _sender) {
    let file = _file.toLowerCase();
    let sender = _sender.startsWith("0x")?_sender.substring(2):_sender;
    sender = sender.toLowerCase();
    
    return file.indexOf(sender) != -1;
}

KeyStorageService.prototype.getKeyStore = async function(sender) {
    let keyStore = this.keystoreMap.get(sender.toLowerCase());

    if(!keyStore) {
        let files = await readdir(this.keyStorePath);
        let filterKeyStores = files.filter(file => this._checkKeyStore(file, sender));
        this.log("Get keystore from file", filterKeyStores);

        if(filterKeyStores.length == 0) {
            let msg = `Invalid sender, keystore not found for ${sender}`;
            this.log(msg)
            throw new ApplicationError('Sender not found', ERROR.BLOCKCHAIN.SENDER_NOT_FOUND);
        }

        if(filterKeyStores.length > 1) {
            let msg = `There is more than one keystore found for ${sender}`;
            this.log(msg)
            throw new ApplicationError('Duplicate keystore file', ERROR.SYSTEM.UNKNOWN_ERROR);
        }
        
        keyStore = fs.readFileSync(`${this.keyStorePath}/${filterKeyStores[0]}`).toString();

        this.keystoreMap.set(sender.toLowerCase(), keyStore);
    }

    return keyStore;
}

module.exports = new KeyStorageService();