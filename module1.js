var qm = require('qminer');
var logger = require('./modules/logger/logger.js');

function DataManagement(t1) {
    this.t = t1;
    logger.info('DataManagement INIT');
}

DataManagement.prototype.handleTest1 = function (req, res) {
    res.status(200).json({ message: "Test1"});
}

DataManagement.prototype.handleTest2 = function (req, res) {
    res.status(200).json({ message: "Test2" });
}

DataManagement.prototype.setupRoutes = function (app) {
    app.get('/t1', this.handleTest1.bind(this));

    app.get('/t2', this.handleTest2.bind(this));
}

module.exports = DataManagement;
