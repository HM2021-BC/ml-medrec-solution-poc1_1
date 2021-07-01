"use strict"

const path = require('path');

const Config = function () {
    let mainPath = path.dirname(require.main.filename);
    let env = process.env.NODE_ENV || "dev";
    let configFile = `${mainPath}/src/config/${env}`;

    let config = require(configFile);
    // console.log("ENV CONFIG -", JSON.stringify(config));

    return config;
}

module.exports = new Config();