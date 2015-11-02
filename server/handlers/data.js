// general includes
var qm = require('qminer');
var logger = require('../../modules/logger/logger.js');

function DataHandler(app, base) {
    logger.debug('Data handler - INIT');
    this.app = app;
    this.base = base;
    this.namespace = '/data/';
}

DataHandler.prototype.setupRoutes = function (app) {
    // custom handler setup
    // add-measurement - get data from JSON, save store and add aggregators
    app.get(this.namespace + 'add-measurement', this.handleAddMeasurement.bind(this));
}

DataHandler.prototype.handleAddMeasurement = function (req, res) {
    logger.debug('[AddMeasurement] Start request handling');
    logger.debug('[AddMeasurement] ' + req.query.data)
    var data = JSON.parse(req.query.data);
    
    for (i = 0; i < data.length; i++) {
        // Parse and store node information
        var node = new Object();
        node.Name = data[i].node.name;
        node.Position = new Array();
        node.Position[0] = data[i].node.lat;
        node.Position[1] = data[i].node.lng;

        var nodeid = this.base.store("Node").push(node);
    }

    res.type('json').status(200).json({'done' : 'well'}).end();
}



module.exports = DataHandler;
