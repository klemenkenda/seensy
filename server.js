var bodyParser = require('body-parser');
var logger = require('./modules/logger/logger.js');
var express = require('express');
var app = express();

function start(_port) {
    var port = _port || proces.env.port || 9600;
    server = app.listen(port);
    logger.info('[Server] Running on port http://localhost:%s/', port)
}

exports.start = start;
exports.app = app;
exports.close = function (done) { server.close(done) };