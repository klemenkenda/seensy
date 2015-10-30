var qm = require('qminer');
var server = require('./server/server.js');
var createBase = require('./schema/create.js');
var env = process.env.NODE_ENV || 'development';
var config = require('./config.json')[env];

qm.verbosity(0);

// read input script argument for mode type. Default is "cleanCreate"
var scriptArgs = (process.argv[2] == null) ? "cleanCreate" : process.argv[2];
var base = createBase.mode(scriptArgs);

// start server
server.init(base);
logger.info("\x1b[32m[Data] Service started at 'http://localhost:%d'\n\x1b[0m", config.dataService.server.port)
server.start(config.dataService.server.port);
