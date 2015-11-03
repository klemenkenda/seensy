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
    
    describe('Store I/O functions', function () {
        beforeEach = function () { };
        afterEach = function () { };

        // Add a measurement
        it('#GET ' + url + "/data/add-measurement?data=...", function (done) {
            var param = '[{ "node": { "id": "842858", "name": "WWO-Turin-Italy", "lat": 45.050, "lng": 7.667, "measurements": [{ "sensorid": "WWO-Turin-Italy-WWO-cloudcover", "value": 0, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "1", "name": "WWO-cloudcover", "phenomenon": "cloudcover", "UoM": "%25" } }, { "sensorid": "WWO-Turin-Italy-WWO-humidity", "value": 53, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "2", "name": "WWO-humidity", "phenomenon": "humidity", "UoM": "%25" } }, { "sensorid": "WWO-Turin-Italy-WWO-precipMM", "value": 0.0, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "3", "name": "WWO-precipMM", "phenomenon": "precipitation", "UoM": "mm" } }, { "sensorid": "WWO-Turin-Italy-WWO-pressure", "value": 1033, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "4", "name": "WWO-pressure", "phenomenon": "pressure", "UoM": "mbar" } }, { "sensorid": "WWO-Turin-Italy-WWO-temp_C", "value": 10, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "5", "name": "WWO-temp_C", "phenomenon": "temperature", "UoM": "deg+C" } }, { "sensorid": "WWO-Turin-Italy-WWO-temp_F", "value": 50, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "6", "name": "WWO-temp_F", "phenomenon": "temperature", "UoM": "deg+F" } }, { "sensorid": "WWO-Turin-Italy-WWO-visibility", "value": 10, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "7", "name": "WWO-visibility", "phenomenon": "visibility", "UoM": "km" } }, { "sensorid": "WWO-Turin-Italy-WWO-weatherCode", "value": 113, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "8", "name": "WWO-weatherCode", "phenomenon": "weatherCode", "UoM": "" } }, { "sensorid": "WWO-Turin-Italy-WWO-winddirDegree", "value": 15, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "9", "name": "WWO-winddirDegree", "phenomenon": "winddirection", "UoM": "deg" } }, { "sensorid": "WWO-Turin-Italy-WWO-windspeedKmph", "value": 1, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "10", "name": "WWO-windspeedKmph", "phenomenon": "windspeed", "UoM": "km%2Fh" } }, { "sensorid": "WWO-Turin-Italy-WWO-windspeedMiles", "value": 0, "timestamp": "2015-11-02T01:10:00.000", "type": { "id": "11", "name": "WWO-windspeedMiles", "phenomenon": "windspeed", "UoM": "mph" } }] } }]';
            
            request(url)
                .get('/data/add-measurement?data=' + param)
                .set('Accept', 'application/json')
                .expect(200, done)
        });
        
        // Add a measurement - no param - should return JSON error message with error description
        it('#GET ' + url + "/data/add-measurement", function (done) {            
            request(url)
                .get('/data/add-measurement')
                .set('Accept', 'application/json')
                .expect(200, done)
        });
        
        // Add a measurement - empty param - should return JSON error message with error description
        it('#GET ' + url + "/data/add-measurement?data=", function (done) {
            request(url)
                .get('/data/add-measurement?data=')
                .set('Accept', 'application/json')
                .expect(200, done)
        });
        
        // Get aggregate store structure
        it('#GET ' + url + "/data/get-aggregate-store-structure?sid=test", function (done) {
            request(url)
                .get('/data/get-aggregate-store-structure?sid=test')
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // Get current aggregates
        it('#GET ' + url + "/data/get-current-aggregates?sid=WWO-Turin-Italy-WWO-humidity", function (done) {
            request(url)
                .get('/data/get-current-aggregates?sid=WWO-Turin-Italy-WWO-humidity')
                .set('Accept', 'application/json')
                .expect(200, done);
        });      
       
        // Get nodes
        it('#GET ' + url + "/data/get-nodes", function (done) {
            request(url)
                .get("/data/get-nodes")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // Get nodes
        it('#GET ' + url + "/data/get-measurement?...", function (done) {
            request(url)
                .get("/data/get-measurement?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
        });

        
        /* PART OF QM TESTS */

        // Get stores commands - localhost:XYZ/qm/stores
        it('#GET ' + url + "/qm/stores", function (done) {
            request(url)
                .get("/qm/stores/")
                .set('Accept', 'application/json')
                .expect(200, done)
        });
    });
});
 