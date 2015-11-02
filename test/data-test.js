// REST API unit tests for data module
var qm = require('qminer');
var server = require('../server.js');
var assert = require('assert');
var path = require('path');
var request = require('supertest');
var env = process.env.NODE_ENV || 'test';
var config = require('../config.json')[env];
var logger = require('../modules/logger/logger.js');

// Set verbosity of QMiner internals
qm.verbosity(1);

// test services
describe('Data - REST API tests', function () {
    var url = config.dataService.server.root;
    var base = undefined;
    
    // create base and start server on localhost before each test
    beforeEach(function () { // this returns same error as *.js
        this.timeout(30000);        

        // Initialise base in clean create mode                   
        base = new qm.Base({
            mode: 'createClean', 
            schemaPath: path.join(__dirname, '../schema/store.def'), // its more robust but, doesen't work from the console (doesent know __dirname)
            dbPath: path.join(__dirname, './db'),
        })
        
        // init server
        server.init();

        // data module instance
        var DataModule = require('../server/dataModule.js');
        var dataModule = new DataModule(server.app, base);
        dataModule.setupRoutes(server.app);
        
        // Import initial data
        // qm.load.jsonFile(base.store("rawStore_1"), path.join(__dirname, "../sandbox/data-small.json"));
        
        // Initialize and start serverserver
        server.start(config.dataService.server.port);
    });
    
    // after each test close base and server
    afterEach(function (done) {
        this.timeout(10000);                
        server.close(done);
        base.close();
    })
    
    // Get list of commands commands - localhost:XYZ/
    it('#GET ' + url + "/", function (done) {
        request(url)
            .get("/")
            .set('Accept', 'application/json')
            .expect(200, done)
    });
     
    // Get stores commands - localhost:XYZ/qm/stores
    it('#GET ' + url + "/qm/stores", function (done) {        
        request(url)
            .get("/qm/stores/")
            .set('Accept', 'application/json')
            .expect(200, done)
    });   

    // Add a measurement
    it('#GET ' + url + "/data/add-measurement?data=...", function (done) {
        var param = '[{ "node": { "id": "842858", "name": "WWO-Turin-Italy", "lat": 45.050, "lng": 7.667, "measurements": [{ "sensorid": "WWO-Turin-Italy-WWO-cloudcover", "value": 0, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "1", "name": "WWO-cloudcover", "phenomenon": "cloudcover", "UoM": "%25" } }, { "sensorid": "WWO-Turin-Italy-WWO-humidity", "value": 53, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "2", "name": "WWO-humidity", "phenomenon": "humidity", "UoM": "%25" } }] } }]';

        request(url)
            .get('/data/add-measurement?data=' + param)
            .set('Accept', 'application/json')
            .expect(200, done)    
    });
});
 