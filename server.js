var bodyParser = require('body-parser');
var logger = require('./modules/logger/logger.js');
var app = undefined;

function init() {
    var express = require('express');
    this.app = express();
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({
        extended: true
    }));
}

function start(_port) {
    var port = _port || proces.env.port || 9600;
    server = this.app.listen(port);
    logger.info('[Server] Running on port http://localhost:%s/', port)
}

exports.init = init;
exports.start = start;
exports.app = app;
exports.close = function (done) { server.close(done) };