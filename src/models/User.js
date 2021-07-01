"use strict";
const mongoose = require('mongoose');
let uniqueValidator = require("mongoose-unique-validator");
let Schema = mongoose.Schema;
const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    type: { type: String, required: true }, // Patient, Provider, AuthViewer
    email: { type: String },
    phone: { type: String },
    address: { type: String },
    identification: { type: String, required: true },
    status: {type: Number, required: true},
    ethAddress: { type: String},
    merkleRoot: { type: String, required: true },
    description: { type: String },
    sg: { type: Object }
});

userSchema.set("timestamps", true); // include timestamps in docs
// apply the mongoose unique validator plugin to geoLocationSchema
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);