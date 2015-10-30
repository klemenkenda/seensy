var routes = require('./routes.js');
var bodyParser = require('body-parser');
var DataHandler = require('./handlers/data.js');
var app = undefined;


function init(base) {
    var express = require('express');
    app = express();
        

    var handlers = {
        service: new DataHandler(base, app)
    };

    // init routes
    routes.setup(app, handlers);
}

function start(_port) {
    var port = _port || proces.env.port || 9600;
    server = app.listen(port);
}

exports.init = init;
exports.start = start;
exports.app = app;
exports.close = function (done) { server.close(done) };