// general includes
var qm = require('qminer');
var logger = require('../modules/logger/logger.js');

// include handlers
var GeneralHandler = require('./handlers/general.js');
var DataHandler = require('./handlers/data.js');
var QMinerHandler = require('./handlers/qminer.js');
var ModelHandler = require('./handlers/model.js');

function DataModule(server, base) {
    logger.debug('Data Module - INIT');
    this.generalHandler = new GeneralHandler(server.app);
    this.qminerHandler = new QMinerHandler(server, base);
    this.dataHandler = new DataHandler(server.app, base);
    // this.modelHandler = new ModelHandler(app);
}

DataModule.prototype.setupRoutes = function (app) {
    // handler's setups    
    this.generalHandler.setupRoutes(app);
    this.dataHandler.setupRoutes(app);
    this.qminerHandler.setupRoutes(app);
    // this.modelHandler.setupRoutes(app);
    
    // custom handler setup
    // app.get('/t1', this.handleTest1.bind(this));
}

module.exports = DataModule;
