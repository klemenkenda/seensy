// general includes
var qm = require('qminer');
var logger = require('../../modules/logger/logger.js');

function QMinerHandler(server, base) {
    logger.debug('QMiner handler - INIT');
    this.server = server;
    this.base = base;
    this.namespace = '/qm/';
}

QMinerHandler.prototype.setupRoutes = function (app) {
    // custom handler setup
    // stores - get stores JSON
    app.get(this.namespace + 'stores', this.handleStores.bind(this));
    // record - get record from the store
    app.get(this.namespace + 'record/:store/:id', this.handleRecord.bind(this));
    // shutdown - shutdown the whole application
    app.get(this.namespace + 'shutdown', this.handleShutdown.bind(this));
    // savebase - saves the current base
    app.get(this.namespace + 'backup', this.handleSaveBase.bind(this));
}

QMinerHandler.prototype.handleStores = function (req, res) {    
    var stores = this.base.getStoreList();
    res.type('json').status(200).json(stores).end();
}

QMinerHandler.prototype.handleRecord = function (req, res) {
    var store = this.base.store(req.params.store);
    if (store == null) res.status(404).json({"error": "Store not found!" })
    res.status(200).json(store[req.params.id]).end();
}

QMinerHandler.prototype.handleShutdown = function (req, res) {
    res.status(200).json("Done");
}

QMinerHandler.prototype.handleSaveBase = function (req, res) {
    var baseIO = require('../../schema/io.js');
    baseIO.backup(this.base, this.server);    
}

module.exports = QMinerHandler;