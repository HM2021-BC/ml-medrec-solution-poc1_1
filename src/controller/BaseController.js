"use strict"

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;
const status = require('http-status');

const Base = require('../common/Base');

const BaseController = function(){}
inherits(BaseController, Base);

BaseController.prototype.generateResponse = function (statusCode, obj) {
    let template = {code: statusCode, msg: status[statusCode], data: obj};
    return template;
}

module.exports = BaseController;