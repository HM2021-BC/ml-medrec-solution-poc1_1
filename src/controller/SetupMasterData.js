"use strict"

const HttpStatus = require('http-status');
const inherits = require('util').inherits;
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);

const Config = require("../common/Config");
const Util = require("../common/Util");
const BaseController = require('./BaseController');
const Constants = require('../common/Constants');
const offchainService = require('../services/OffChainService');
const onchainService = require('../services/OnchainService');

const SetupMasterData = function(){
    this.init();
}

inherits(SetupMasterData, BaseController);

SetupMasterData.prototype.init = function(){
    try {
        let user = {username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'Admin', 
            type: 'Admin', identification: 'Admin', status: Constants.USER_STATUS.Approved,
            email: 'admin@morpheuslabs.io', description: 'Morpheuslabs Admin'
        };

        user = Util.generateSignature(user, Config.MASTER_ETH_ACCOUNT);
        user.password = bcrypt.hashSync(user.password, salt);

        offchainService.saveUser(user, (err, user) => {
            if(err) this.log('There is error in saving user', err);
            this.log('Inited default admin (admin/admin)');
        });

        let diagnoseCat = { code: 'C001', name: 'COVID-19 Test', class: '1', type: '1', note: 'COVID-19 Testing' };

        offchainService.saveDiagnoseCategory(diagnoseCat, (err, user) => {
            if(err) this.log('There is error in saving diagnoseCat', err);
        });
    } catch (err) {
        this.log(err);
    }
}

module.exports = new SetupMasterData();