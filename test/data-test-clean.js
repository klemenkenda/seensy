// REST API unit tests for data module
var qm = require('qminer');
var server = require('../server.js');
var assert = require('assert');
var path = require('path');
var request = require('supertest');
var env = process.env.NODE_ENV || 'test';
var config = require('../config.json')[env];
var logger = require('../modules/logger/logger.js');
var baseIO = require('../schema/io.js');

// Set verbosity of QMiner internals
qm.verbosity(1);

// test services
describe('Data - REST API tests', function () {
    var url = config.dataService.server.root;
    var base = undefined;    

    // create base and start server on localhost before each test
    before(function () { // this returns same error as *.js
        this.timeout(30000);
        
        // Initialise base in clean create mode                   
        base = new qm.Base({
            mode: 'createClean', 
            schemaPath: path.join(__dirname, '../schema/store.def'), // its more robust but, doesen't work from the console (doesent know __dirname)
            dbPath: path.join(__dirname, './db'),
        });        
        
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
    after(function (done) {
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
                .expect(200, {
                "Time": "2015-11-02T01:10:00.000",
                "Date": "2015-11-02",
                "last-measurement": 53,
                "ema1h": 53,
                "ema6h": 53,
                "ema1d": 53,
                "ema1w": 53,
                "ema1m": 53,
                "ema1y": 53,
                "sum1h": 53,
                "min1h": 53,
                "max1h": 53,
                "var1h": 0,
                "ma1h": 53,
                "sum6h": 53,
                "min6h": 53,
                "max6h": 53,
                "var6h": 0,
                "ma6h": 53,
                "sum1d": 53,
                "min1d": 53,
                "max1d": 53,
                "var1d": 0,
                "ma1d": 53,
                "sum1w": 53,
                "min1w": 53,
                "max1w": 53,
                "var1w": 0,
                "ma1w": 53,
                "sum1m": 53,
                "min1m": 53,
                "max1m": 53,
                "var1m": 0,
                "ma1m": 53,
                "sum1y": 53,
                "min1y": 53,
                "max1y": 53,
                "var1y": 0,
                "ma1y": 53
            }, done);
        });
        
        // Get nodes
        it('#GET ' + url + "/data/get-nodes", function (done) {
            request(url)
                .get("/data/get-nodes")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // Get measurement
        it('#GET ' + url + "/data/get-measurement?...", function (done) {
            request(url)
                .get("/data/get-measurement?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // n-get-measurement for 1 sensor
        it('#GET ' + url + "/data/n-get-measurement?sensorNames=[1 sensor]", function (done) {
            request(url)
                .get("/data/n-get-measurement?sensorNames=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // n-get-measurement for multiple sensors
        it('#GET ' + url + "/data/n-get-measurement?sensorNames=[multiple sensors]", function (done) {
            request(url)
                .get("/data/n-get-measurement?sensorNames=WWO-Turin-Italy-WWO-humidity,WWO-Turin-Italy-WWO-cloudcover,WWO-Turin-Italy-WWO-temp_C&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
        });               
        
        // get-aggregate (MA, 1D)
        it('#GET ' + url + "/data/get-aggregate?...", function (done) {
            request(url)
                .get("/data/get-aggregate?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03&type=ma&window=1d")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // n-get-aggregate (MA, 1D)
        it('#GET ' + url + "/data/n-get-aggregate?...", function (done) {
            request(url)
                .get("/data/n-get-aggregate?sensorNames=WWO-Turin-Italy-WWO-humidity,WWO-Turin-Italy-WWO-cloudcover,WWO-Turin-Italy-WWO-temp_C&startDate=2015-11-01&endDate=2015-11-03&type=ma&window=1d")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // get-aggregates
        it('#GET ' + url + "/data/get-aggregates?...", function (done) {
            request(url)
                .get("/data/get-aggregate?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        
        // n-get-aggregate (MA, 1D)
        it('#GET ' + url + "/data/n-get-aggregates?...", function (done) {
            request(url)
                .get("/data/n-get-aggregate?sensorNames=WWO-Turin-Italy-WWO-humidity,WWO-Turin-Italy-WWO-cloudcover,WWO-Turin-Italy-WWO-temp_C&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
        });
        // TODO        
        // add content tests for all functions
        
        /* PART OF QM TESTS */
        
        // end does not happen, when I exit describe block - manual close
        // Get stores commands - localhost:XYZ/qm/stores
        it('#GET ' + url + "/qm/stores", function (done) {
            request(url)
                .get("/qm/stores/")
                .set('Accept', 'application/json')
                .expect(200, done)
        });        
        
        it('saving stream aggregates, closing server and base', function (done) {
            baseIO.saveStreamAggrs(base, path.join(__dirname, './db'));
            base.close();
            server.close(done);
        });
    });
    
    
    // todo check aggregate values
    describe("Data - reload base - REST API tests", function () {
        before(function () {            
            this.timeout(30000);
            
            // Initialise base in clean create mode                   
            base = new qm.Base({
                mode: 'open', 
                dbPath: path.join(__dirname, './db'),
            })
            baseIO.loadStreamAggrs(base, path.join(__dirname, './db'));
            
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
        
        // Get list of commands commands - localhost:XYZ/
        it('#GET ' + url + "/", function (done) {
            request(url)
            .get("/")
            .set('Accept', 'application/json')
            .expect(200, done)
        });
        
        describe('Store I/O functions', function () {
            
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
                .expect(200, {
                    "Time": "2015-11-02T01:10:00.000",
                    "Date": "2015-11-02",
                    "last-measurement": 53,
                    "ema1h": 53,
                    "ema6h": 53,
                    "ema1d": 53,
                    "ema1w": 53,
                    "ema1m": 53,
                    "ema1y": 53,
                    "sum1h": 53,
                    "min1h": 53,
                    "max1h": 53,
                    "var1h": 0,
                    "ma1h": 53,
                    "sum6h": 53,
                    "min6h": 53,
                    "max6h": 53,
                    "var6h": 0,
                    "ma6h": 53,
                    "sum1d": 53,
                    "min1d": 53,
                    "max1d": 53,
                    "var1d": 0,
                    "ma1d": 53,
                    "sum1w": 53,
                    "min1w": 53,
                    "max1w": 53,
                    "var1w": 0,
                    "ma1w": 53,
                    "sum1m": 53,
                    "min1m": 53,
                    "max1m": 53,
                    "var1m": 0,
                    "ma1m": 53,
                    "sum1y": 53,
                    "min1y": 53,
                    "max1y": 53,
                    "var1y": 0,
                    "ma1y": 53
                }, done);
            });
            
            // Get nodes
            it('#GET ' + url + "/data/get-nodes", function (done) {
                request(url)
                .get("/data/get-nodes")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // Get measurement
            it('#GET ' + url + "/data/get-measurement?...", function (done) {
                request(url)
                .get("/data/get-measurement?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // n-get-measurement for 1 sensor
            it('#GET ' + url + "/data/n-get-measurement?sensorNames=[1 sensor]", function (done) {
                request(url)
                .get("/data/n-get-measurement?sensorNames=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // n-get-measurement for multiple sensors
            it('#GET ' + url + "/data/n-get-measurement?sensorNames=[multiple sensors]", function (done) {
                request(url)
                .get("/data/n-get-measurement?sensorNames=WWO-Turin-Italy-WWO-humidity,WWO-Turin-Italy-WWO-cloudcover,WWO-Turin-Italy-WWO-temp_C&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // get-aggregate (MA, 1D)
            it('#GET ' + url + "/data/get-aggregate?...", function (done) {
                request(url)
                .get("/data/get-aggregate?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03&type=ma&window=1d")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // n-get-aggregate (MA, 1D)
            it('#GET ' + url + "/data/n-get-aggregate?...", function (done) {
                request(url)
                .get("/data/n-get-aggregate?sensorNames=WWO-Turin-Italy-WWO-humidity,WWO-Turin-Italy-WWO-cloudcover,WWO-Turin-Italy-WWO-temp_C&startDate=2015-11-01&endDate=2015-11-03&type=ma&window=1d")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // get-aggregates
            it('#GET ' + url + "/data/get-aggregates?...", function (done) {
                request(url)
                .get("/data/get-aggregate?sensorName=WWO-Turin-Italy-WWO-humidity&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
            
            // n-get-aggregate (MA, 1D)
            it('#GET ' + url + "/data/n-get-aggregates?...", function (done) {
                request(url)
                .get("/data/n-get-aggregate?sensorNames=WWO-Turin-Italy-WWO-humidity,WWO-Turin-Italy-WWO-cloudcover,WWO-Turin-Italy-WWO-temp_C&startDate=2015-11-01&endDate=2015-11-03")
                .set('Accept', 'application/json')
                .expect(200, done);
            });
        });
    });
});


 