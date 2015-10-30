var qm = require('qminer');
var server = require('./server.js');
var createBase = require('./schema/create.js');
var env = process.env.NODE_ENV || 'development';
var config = require('./config.json')[env];

qm.verbosity(0);

// read input script argument for mode type. Default is "cleanCreate"
var scriptArgs = (process.argv[2] == null) ? "cleanCreate" : process.argv[2];
var base = createBase.mode(scriptArgs);

// Use module1
var DataManagement = require('./module1.js')
var m1 = new DataManagement()
m1.setupRoutes(server.app)

// Use module2
var Models = require('./module2.js')
var m1 = new Models()
m1.setupRoutes(server.app)

// start server
server.start(config.dataService.server.port);
