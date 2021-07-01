"use strict"

const inherits = require('util').inherits;
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


const Base = require('./common/Base');
const Config = require('./common/Config');
const MedRecController = require('./controller/MedRecController');
const LoginController = require('./controller/LoginController');
const AdminController = require('./controller/AdminController');
const Covid19TestController = require('./controller/Covid19TestController');

const { checkToken } = require('./middleware/VerifyToken');
const { checkUser } = require('./middleware/ValidateUsername');
const { errorHandler } = require('./middleware/ErrorHandler');
const { responseFormat } = require('./middleware/ResponseFormat');

const ApplicationError = require("./errors/ApplicationError");

const MedRec = function(app){
    this.PORT = process.env.PORT || 3000;
    this.app = app;
    this.http = require('http').Server(app);

    this.medrecController = new MedRecController();
    this.loginController = new LoginController();
    this.adminController = new AdminController();
    this.covid19TestController = new Covid19TestController();
    

    this.init();
}

inherits(MedRec, Base);

MedRec.prototype.init = async function () {
    let uri = `mongodb://${Config.MONGO.host}:${Config.MONGO.port}/${Config.MONGO.dbName}`;
    if(!Config.PRODUCTION) {
        this.mongod = new MongoMemoryServer();
        uri = await this.mongod.getConnectionString();

        this.onStop();
    }
    this.log("Connect URL", uri);

    const mongooseOpts = {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useCreateIndex: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000
    };

    await mongoose.connect(uri, mongooseOpts);
}

MedRec.prototype.onStop = function() {
    //do something when app is closing
    process.on('exit', this.exitHandler.bind(this));

    //catches ctrl+c event
    process.on('SIGINT', this.exitHandler.bind(this));

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', this.exitHandler.bind(this));
    process.on('SIGUSR2', this.exitHandler.bind(this));

    //catches uncaught exceptions
    process.on('uncaughtException', this.exitHandler.bind(this));
}

MedRec.prototype.exitHandler = async function() {
    this.log('Shuting down mongod daemon');
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await this.mongod.stop();
}

MedRec.prototype.start = function(){
    this.applyRoutes();

    this.app.use(errorHandler);
    // this.app.use(responseFormat);

    this.log("MedRec app started");
    this.http.listen(this.PORT, () => this.log(`App listening on port ${this.PORT}!`));
}

MedRec.prototype.applyRoutes = function() {
    //
    this.app.get('/', (req, res) => res.redirect('/api-docs/index'));

    //user apis
    this.app.post('/v1/user/login', (req, res) => this.loginController.signin(req, res));
    this.app.post('/v1/user/register', checkUser, (req, res, next) => this.medrecController.register(req, res, next));

    // Med apis
    this.app.get('/v1/med/diagnosecats', (req, res) => this.medrecController.getDiagnosesCategory(req, res));
    this.app.get('/v1/med/diagnoses/:patientAddress', [checkToken], (req, res, next) => this.medrecController.getDiagnoses(req, res, next));
    this.app.get('/v1/med/diagnoses/result/:diagnoseMerkleRoot', [checkToken], (req, res, next) => this.covid19TestController.getCovidTests(req, res, next));

    this.app.post('/v1/med/patient', [checkToken, checkUser], (req, res, next) => this.medrecController.addPatient(req, res, next));
    this.app.post('/v1/med/diagnose', checkToken, (req, res, next) => this.medrecController.addDiagnose(req, res, next));
    this.app.post('/v1/med/diagnose/result', checkToken, (req, res, next) => this.covid19TestController.addCovidTest(req, res, next));

    // admin apis
    this.app.get('/v1/admin/providers', checkToken, (req, res) => this.adminController.getProviders(req, res));
    this.app.get('/v1/admin/authinstitutes', checkToken, (req, res) => this.adminController.getAuthenInstitutes(req, res));

    this.app.post('/v1/admin/user/approve', checkToken, (req, res) => this.adminController.approveUser(req, res));
    this.app.post('/v1/admin/provider', checkToken, (req, res) => this.adminController.addProvider(req, res));
    this.app.post('/v1/admin/authviewer', checkToken, (req, res) => this.adminController.addAuthInstitute(req, res));
}

module.exports = MedRec;
