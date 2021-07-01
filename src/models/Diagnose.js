'use strict';
const mongoose = require('mongoose');

let uniqueValidator = require("mongoose-unique-validator");
let Schema = mongoose.Schema;
const diagnose = new Schema({
    diagnoseCode: { type: String, required: true },
    providerAddress: {type: String, required: true},
    patientAddress: { type: String, required: true },
    name: { type: String, required: true },
    time: { type: Date, required: true },
    merkleRoot: { type: String, required: true },
    note: { type: String }
});

diagnose.set("timestamps", true); // include timestamps in docs
// apply the mongoose unique validator plugin to geoLocationSchema
diagnose.plugin(uniqueValidator);

module.exports = mongoose.model('Diagnose', diagnose);