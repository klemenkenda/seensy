// general includes
var qm = require('qminer');
var logger = require('../../modules/logger/logger.js');

function DataHandler(app, base) {
    logger.debug('Data handler - INIT');
    this.app = app;
    this.base = base;
    this.namespace = '/data/';
}

DataHandler.prototype.setupRoutes = function (app) {
    // custom handler setup
    // add-measurement - get data from JSON, save store and add aggregators
    app.get(this.namespace + 'add-measurement', this.handleAddMeasurement.bind(this));
}

DataHandler.prototype.handleAddMeasurement = function (req, res) {
    logger.debug('[AddMeasurement] Start request handling');
    logger.debug('[AddMeasurement] ' + req.query.data)
    var data = JSON.parse(req.query.data);
    
    for (i = 0; i < data.length; i++) {
        // Parse and store node information
        var node = new Object();
        node.Name = data[i].node.name;
        node.Position = new Array();
        node.Position[0] = data[i].node.lat;
        node.Position[1] = data[i].node.lng;

        var nodeid = this.base.store("Node").push(node);

        var measurements = data[i].node.measurements;
        for (j = 0; j < measurements.length; j++) {
            // Parse and store type information
            var type = new Object();
            type.Name = measurements[j].type.name;
            type.Phenomena = measurements[j].type.phenomenon;
            type.UoM = measurements[j].type.UoM;

            var typeid = this.base.store("Type").push(type);

            // Parse and store node information
            var sensor = new Object();
            sensor.Name = measurements[j].sensorid;
            sensor.NodeId = nodeid;
            sensor.TypeId = typeid;

            var sensorid = this.base.store("Sensor").push(sensor);
            
            // Create names for additional stores
            var measurementStoreStr = "M" + nameFriendly(sensor.Name);
            var aggregateStoreStr = "A" + nameFriendly(sensor.Name);
            var resampledStoreStr = "R" + nameFriendly(sensor.Name);

            var measurementStore = this.base.store(measurementStoreStr);
            
            // If the store does not exist
            if (measurementStore == null) {
                // Create Measumerment Store names 'M-sensorname'
                measurementStore = this.base.createStore([{
                        "name": measurementStoreStr,
                        "fields": [
                            { "name": "Time", "type": "datetime" },
                            { "name": "Date", "type": "string" },
                            { "name": "Val", "type": "float" }
                        ],
                        "joins": [],
                        "keys": [
                            { "field": "Date", "type": "value", "sort": "string", "vocabulary": "date_vocabulary" }
                        ]
                    }]);
            }

            // Parse and store measurement
            var measurement = new Object();
            measurement.Val = Number(measurements[j].value);
            measurement.Time = measurements[j].timestamp;
            measurement.Date = measurements[j].timestamp.substr(0, 10);
            
            logger.debug('[AddMeasurement] ' + '{ "Val": ' + measurement.Val + ', "Time": "' + measurement.Time + '", "Date": "' + measurement.Date + '"}');
            measurementStore.push(measurement);
        }
    }

    res.type('json').status(200).json({'done' : 'well'}).end();
}

function nameFriendly(myName) {
    return myName.replace(/\W/g, '');
}

module.exports = DataHandler;
