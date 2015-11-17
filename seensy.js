﻿var logger = require('./modules/logger/logger.js');
var qm = require('qminer');
var server = require('./server.js');
var createBase = require('./schema/create.js');
var baseIO = require('./schema/io.js');
var env = process.env.NODE_ENV || 'development';
var config = require('./config.json')[env];
var schedule = require('node-schedule');

qm.verbosity(0);

// read input script argument for mode type. Default is "cleanCreate"
var scriptArgs = (process.argv[2] == null) ? "cleanCreate" : process.argv[2];
//var base = createBase.mode(scriptArgs);
var base = baseIO.openBase(scriptArgs);
// TODO: do we need to pass base or can we use it globally?
server.init();

// data module instance
var DataModule = require('./server/dataModule.js');
var dataModule = new DataModule(server.app, base);
dataModule.setupRoutes(server.app);

// modeling module
// var ModelModule = require('./modelModule.js')
// var modelModule = new ModelModule()
// modelModule.setupRoutes(server.app)

// schedule backup
var j = schedule.scheduleJob({ hour: 00, minute: 00 }, function () {
    
});

// start server
server.start(config.dataService.server.port);

// gracefulShutdown
var gracefulShutdown = function () {
    logger.info('Shutdown');
    baseIO.shutdown(base, server);
}

// listen for TERM signal .e.g. kill 
process.on('SIGTERM', gracefulShutdown);

// listen for INT signal e.g. Ctrl-C
process.on('SIGINT', gracefulShutdown);

// TODO: Inform webserver this instance is up and running
