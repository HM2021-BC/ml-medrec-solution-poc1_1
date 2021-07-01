"use strict";

const mongoose = require('mongoose');
let uniqueValidator = require("mongoose-unique-validator");
let Schema = mongoose.Schema;
const diagnoseCat = new Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    class: { type: String, required: true },
    type: { type: String, required: true },
    note: { type: String }
});

diagnoseCat.set("timestamps", true); // include timestamps in docs
// apply the mongoose unique validator plugin to geoLocationSchema
diagnoseCat.plugin(uniqueValidator);

module.exports = mongoose.model('diagnoseCategory', diagnoseCat);