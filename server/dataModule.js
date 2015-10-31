// general includes
var qm = require('qminer');
var logger = require('../modules/logger/logger.js');

// include handlers
var GeneralHandler = require('./handlers/general.js');
var DataHandler = require('./handlers/data.js');
var QminerHandler = require('./handlers/qminer.js');
var ModelHandler = require('./handlers/model.js');

function DataModule(app) {
    logger.info('Data Module - INIT');
    this.generalHandler = new GeneralHandler(app);
}

DataModule.prototype.setupRoutes = function (app) {
    // handler's setups
    
    this.generalHandler.setupRoutes(app);
    // DataHandler.setupRoutes(app);
    // QminerHandler.setupRoutes(app);
    // ModelHandler.setupRoutes(app);
    
    // custom handler setup
    // app.get('/t1', this.handleTest1.bind(this));
}

module.exports = DataModule;
