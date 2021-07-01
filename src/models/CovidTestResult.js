'use strict';
const mongoose = require('mongoose');

let uniqueValidator = require("mongoose-unique-validator");
let Schema = mongoose.Schema;

const covidTestResult = new Schema({
    diagnoseMerkleRoot: { type: String, required: true, unique: true },
    providerAddress: { type: String, required: true },
    patientAddress: { type: String, required: true },
    rt_qpcr: { type: Number, required: true },
    igm: { type: Number, required: true },
    igg: { type: Number, required: true },
    merkleRoot: { type: String, required: true },
    note: { type: String }
});

covidTestResult.set("timestamps", true); // include timestamps in docs
// apply the mongoose unique validator plugin to geoLocationSchema
covidTestResult.plugin(uniqueValidator);

module.exports = mongoose.model('CovidTestResult', covidTestResult);