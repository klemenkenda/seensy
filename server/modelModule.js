// general includes
var qm = require('qminer');
var logger = require('../modules/logger/logger.js');

// include handlers
var GeneralHandler = require('./handlers/general.js');
var DataHandler = require('./handlers/data.js');
var QMinerHandler = require('./handlers/qminer.js');
var ModelHandler = require('./handlers/model.js');

function ModelModule(app, base) {
    logger.debug('Data Module - INIT');
    this.generalHandler = new GeneralHandler(app);
    this.qminerHandler = new QMinerHandler(app, base);
    this.dataHandler = new DataHandler(app, base);
    this.modelHandler = new ModelHandler(app);
}

ModelModule.prototype.setupRoutes = function (app) {
    // handler's setups    
    this.generalHandler.setupRoutes(app);
    this.dataHandler.setupRoutes(app);
    this.qminerHandler.setupRoutes(app);
    this.modelHandler.setupRoutes(app);
}

module.exports = ModelModule;
