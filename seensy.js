var logger = require('./modules/logger/logger.js');
var qm = require('qminer');
var server = require('./server.js');
var createBase = require('./schema/create.js');
var baseIO = require('./schema/io.js');
var env = process.env.NODE_ENV || 'development';
var config = require('./config.json')[env];

qm.verbosity(0);

// read input script argument for mode type. Default is "cleanCreate"
var scriptArgs = (process.argv[2] == null) ? "cleanCreate" : process.argv[2];
var base = createBase.mode(scriptArgs);

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

// start server
server.start(config.dataService.server.port);
