"use strict"

const EventEmitter = require('events').EventEmitter;
const inherits = require('util').inherits;

const Base = function(){}
inherits(Base, EventEmitter);

Base.prototype.log = function () {
    let date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ;
    let args = Array.from(arguments);
    //let msg = args.shift();
    let msg = `[${date}][${this.constructor.name}]`;
    args.unshift(msg);
    console.log.apply(console, args);
}

module.exports = Base;