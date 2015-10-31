var qm = require('qminer');
var logger = require('../modules/logger/logger.js');

function DataManagement(t1) {
    this.t = t1;
    logger.info('DataManagement INIT');
}

DataManagement.prototype.handleTest1 = function (req, res) {
    res.status(200).json({ message: "Test3" });
}

DataManagement.prototype.handleTest2 = function (req, res) {
    res.status(200).json({ message: "Test4" });
}

DataManagement.prototype.setupRoutes = function (app) {
    app.get('/t3', this.handleTest1.bind(this));

    app.get('/t4', this.handleTest2.bind(this));
}

module.exports = DataManagement;
