"use strict";

const express = require('express');
const bodyParser = require("body-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const MedRec = require('./src/MedRec');
const { errorHandler } = require('./src/middleware/ErrorHandler');

const app = new express();
// load routings
// require('./routes/api')(app);
// app.use(express.static('client'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use(responseFormat);

const medRec = new MedRec(app);
medRec.start();