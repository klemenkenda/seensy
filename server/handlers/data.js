// general includes
var qm = require('qminer');
var logger = require('../../modules/logger/logger.js');
require('./config.js')

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

/**
 * Get data from JSON, save node, type and measurements to the stores.
 * If measurement store does not exist create it, together with all aggregates.
 *
 * @param req  {model:express~Request}  Request
 * @param res  {model:express~Response}  Response  
 */
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
                // Create Measumerment Store named 'M-sensorname'
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

                // Create aggregate store names 'A-sensorname'
                var aggregateStoreDefinition = getAggregateStoreStructure(aggregateStoreStr);
                this.base.createStore([aggregateStoreDefinition]);

                // Add a tick
                measurementStore.addStreamAggr({
                    name: "tick", type: "timeSeriesTick",
                    timestamp: "Time", value: "Val"
                })

                // Adding tick based aggregates
                tickTimes.forEach(function (time) {
                    tickAggregates.forEach(function (aggregate) {
                        aggregateObj = {
                            name: aggregate.name + time.name, type: aggregate.type, inAggr: "tick",
                            emaType: "previous", interval: time.interval * 60 * 60 * 1000 - 1, initWindow: 0 * 60 * 1000
                        };
                        measurementStore.addStreamAggr(aggregateObj);
                    })
                });

                // Adding winbuff based aggregates
                bufTimes.forEach(function (time) {
                    var bufname = 'winbuff' + time.name;
                    // adding timeserieswinbuff aggregate
                    measurementStore.addStreamAggr({
                        name: bufname, type: "timeSeriesWinBuf",
                        timestamp: "Time", value: "Val", winsize: time.interval * 60 * 60 * 1000 - 1
                    });
                    
                    bufAggregates.forEach(function (aggregate) {
                        aggregateObj = {
                            name: aggregate.name + time.name, type: aggregate.type, inAggr: bufname
                        };
                        measurementStore.addStreamAggr(aggregateObj);
                    })
                });

                logger.debug('[Add Measurement] Created new measurement store')
                logger.debug('[Add Measurement] Aggregates: ' + measurementStore.getStreamAggrNames())
            }

            // Parse and store measurement
            var measurement = new Object();
            measurement.Val = Number(measurements[j].value);
            measurement.Time = measurements[j].timestamp;
            measurement.Date = measurements[j].timestamp.substr(0, 10);
                        
            measurementStore.push(measurement);

            // Store current aggregates
            var aggregateStore = this.base.store(aggregateStoreStr);
            var aggregateid = aggregateStore.push(getCurrentAggregates(measurementStore));
            
            logger.debug('[AddMeasurement] Pushed' + '{ "Val": ' + measurement.Val + ', "Time": "' + measurement.Time + '", "Date": "' + measurement.Date + '"}');
        }
    }

    res.type('json').status(200).json({'done' : 'well'}).end();
}

function nameFriendly(myName) {
    return myName.replace(/\W/g, '');
};


/**
 * Create structure of the aggregate store based on the name and configuration.
 *
 * @param aggregateStoreStr  {String}  Name of the aggregate store
 * @return                   {Object}  Structure of the aggregate store   
 */
function getAggregateStoreStructure(aggregateStoreStr) {
    
    var data = {
        "name": aggregateStoreStr,
        "fields": [
            { "name": "Time", "type": "datetime" },
            { "name": "Date", "type": "string" }
        ],
        "joins": [],
        "keys": [
            { "field": "Date", "type": "value", "sort": "string", "vocabulary": "date_vocabulary" }
        ]
    };
    
    // adding tick-base aggregates
    tickTimes.forEach(function (time) {
        tickAggregates.forEach(function (aggregate) {
            aggrname = aggregate.name + time.name;
            data["fields"].push({ "name": aggrname, "type": "float" });
        })
    });
    
    // adding tick-base aggregates
    bufTimes.forEach(function (time) {
        bufAggregates.forEach(function (aggregate) {
            aggrname = aggregate.name + time.name;
            data["fields"].push({ "name": aggrname, "type": "float" });
        })
    });
    
    return data;
};

/**
 * Return last data point from specified aggregate store
 *
 * @param measurementStore {module:qm~Store}  Name of the aggregate store
 * @return                 {Object}           Data from aggregate store 
 */
function getCurrentAggregates(measurementStore) {
    var data = {};
    
    data["Time"] = measurementStore.getStreamAggr("tick").val.Time;
    data["Date"] = data["Time"].substring(0, 10);
    
    // adding last measurement
    data["last-measurement"] = measurementStore.getStreamAggr("tick").val.Val;
    
    // adding tick-base aggregates
    tickTimes.forEach(function (time) {
        tickAggregates.forEach(function (aggregate) {
            aggrname = aggregate.name + time.name;
            aggrtype = aggregate.name;
            data[aggrname] = measurementStore.getStreamAggr(aggrname).val.Val;
        })
    });
    
    // adding tick-base aggregates
    bufTimes.forEach(function (time) {
        bufAggregates.forEach(function (aggregate) {
            aggrname = aggregate.name + time.name;
            aggrtype = aggregate.name;
            data[aggrname] = measurementStore.getStreamAggr(aggrname).val.Val;
        })
    });
    
    return data;
};

module.exports = DataHandler;
