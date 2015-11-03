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
    // get-aggregate-store-structure - get the definition of aggregate store
    app.get(this.namespace + 'get-aggregate-store-structure', this.handleGetAggregateStoreStructure.bind(this));
    // get-current-aggregates - get last aggregates from aggregate store
    app.get(this.namespace + 'get-current-aggregates', this.handleGetCurrentAggregates.bind(this));
    // get-nodes - Get information on nodes and their sensors
    app.get(this.namespace + 'get-nodes', this.handleGetNodes.bind(this));
    // get-measurement - Get measurements from specified store during dates
    app.get(this.namespace + 'get-measurement', this.handleGetMeasurement.bind(this));
    // n-get-measurement - Get measurements from multiple stores during dates
    app.get(this.namespace + 'n-get-measurement', this.handleNGetMeasurement.bind(this));
}

/**
 * Parse data from request and send it to add measurements
 *
 * @param req  {model:express~Request}  Request
 * @param res  {model:express~Response}  Response  
 */
DataHandler.prototype.handleAddMeasurement = function (req, res) {
    logger.debug('[AddMeasurement] Start request handling');
    logger.debug('[AddMeasurement] ' + req.query.data)
    var data = JSON.parse(req.query.data);
    
    this.addMeasurement(data);

    res.status(200).json({'done' : 'well'}).end();
}

/**
 * Save node, type and measurements to the stores.
 * If measurement store does not exist create it, together with all aggregates.
 *
 * @param data  {model:express~Request}  data to be added to stores
 */
DataHandler.prototype.addMeasurement = function (data, control){
    // Check if we want to do control
    control = typeof control !== 'undefined' ? control : true;

    // Walk thru the data
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
                if (control) {
                    // Create aggregate store names 'A-sensorname'
                    var aggregateStoreDefinition = this.getAggregateStoreStructure(aggregateStoreStr);
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
                }
                
                logger.debug('[Add Measurement] Created new measurement store')
                logger.debug('[Add Measurement] Aggregates: ' + measurementStore.getStreamAggrNames())
            }
            
            // Parse and store measurement
            var measurement = new Object();
            measurement.Val = Number(measurements[j].value);
            measurement.Time = measurements[j].timestamp;
            measurement.Date = measurements[j].timestamp.substr(0, 10);
            
            // TODO: Check if measurement is new or not
            measurementStore.push(measurement);
            
            // Store current aggregates
            if (control) {
                var aggregateStore = this.base.store(aggregateStoreStr);
                var aggregateid = aggregateStore.push(this.getCurrentAggregates(measurementStore));
            }
            logger.debug('[AddMeasurement] Pushed' + '{ "Val": ' + measurement.Val + ', "Time": "' + measurement.Time + '", "Date": "' + measurement.Date + '"}');
        }
    }
}


/**
 * Get structure of specified aggregate store
 *
 * @param req  {model:express~Request}   Request
 * @param res  {model:express~Response}  Response  
 */
DataHandler.prototype.handleGetAggregateStoreStructure = function (req, res) {
    var aggregateStoreStr = "A" + nameFriendly(req.query.sid);
    var data = this.getAggregateStoreStructure(aggregateStoreStr);
    res.status(200).json(data);
}

/**
 * Create structure of the aggregate store based on the name and configuration.
 *
 * @param aggregateStoreStr  {String}  Name of the aggregate store
 * @return                   {Object}  Structure of the aggregate store   
 */
DataHandler.prototype.getAggregateStoreStructure = function (aggregateStoreStr) {
    
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
}

/**
 * Get last aggregates from specified aggregate store
 *
 * @param req  {model:express~Request}   Request
 * @param res  {model:express~Response}  Response  
 */
DataHandler.prototype.handleGetCurrentAggregates = function (req, res) {
    var measurementStoreStr = "M" + nameFriendly(req.query.sid);
    var measurementStore = this.base.store(measurementStoreStr);
    var data = this.getCurrentAggregates(measurementStore);
    res.status(200).json(data);
}

/**
 * Return last data point from specified aggregate store
 *
 * @param measurementStore {module:qm~Store}  Name of the aggregate store
 * @return                 {Object}           Data from aggregate store 
 */
DataHandler.prototype.getCurrentAggregates = function(measurementStore) {
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
}

/**
 *  Get all the nodes and their information
 *
 * @param req  {model:express~Request}   Request
 * @param res  {model:express~Response}  Response  
 */
DataHandler.prototype.handleGetNodes = function (req, res) {
    var recSet = this.base.store('Node').allRecords;
    
    var str = '[\n';
    for (var i = 0; i < recSet.length; i++) {
        // Format node information
        str += '  {\n';
        str += '    "Name": "' + recSet[i].Name + '",\n';
        str += '    "Position": [' + recSet[i].Position + '],\n';
        str += '    "Sensors": [\n';
        
        // Get all the sensors for this node
        sensorSet = recSet[i].hasSensor.store.allRecords;
        
        for (var j = 0; j < sensorSet.length; j++) {
            
            // Get measurement store
            var measurementStoreStr = "M" + nameFriendly(String(sensorSet[j].Name));
            measurementStore = this.base.store(measurementStoreStr);
            
            // If store exists give data
            var startDate, endDate, val;
            if ((measurementStore != null) && (measurementStore.empty == false)) {
                startDate = measurementStore.first.Date;
                endDate = measurementStore.last.Date;
                val = measurementStore.last.Val;
            } else {
                startDate = "0000-00-00";
                endDate = "0000-00-00";
                val = -999.999;
            }
            
            // Format sensor information
            if (j > 0) str += ',\n';
            str += '      {\n';
            str += '        "Name":"' + sensorSet[j].Name + '",\n';
            str += '        "Phenomenon":"' + sensorSet[j].Type.Phenomena + '",\n';
            str += '        "UoM":"' + sensorSet[j].Type.UoM + '",\n';
            str += '        "StartDate":"' + startDate + '",\n';
            str += '        "EndDate":"' + endDate + '",\n';
            str += '        "Val":"' + val + '"\n';
            str += '      }';
        }

        str += '\n    ]\n'
        str += '  }';
        if (i != recSet.length - 1) str += ',\n';
    }
    str += "\n]";
    console.log(str);
    res.status(200).send(str);
}

/**
 * Add dummy sensor measurement (to inser date into a common key vocabulary)
 *
 * @param startDateStr  {String}  Starting date
 * @param enddateStr    {String}  End date
 */
DataHandler.prototype.addDate = function (startDateStr, endDateStr) {
    var startDateRequest = '[{"node":{"id":"virtual-node","name":"virtual-node","lat":0,"lng":0, \
        "measurements":[{"sensorid":"virtual-node-request","value":1.0,"timestamp":"' + startDateStr +
        'T00:00:00.000","type":{"id":"0","name":"virtual-request","phenomenon":"request","UoM":"r"}}]}}]';
    var endDateRequest = '[{"node":{"id":"virtual-node","name":"virtual-node","lat":0,"lng":0, \
        "measurements":[{"sensorid":"virtual-node-request","value":1.0,"timestamp":"' + endDateStr +
        'T00:00:00.000","type":{"id":"0","name":"virtual-request","phenomenon":"request","UoM":"r"}}]}}]';
    logger.debug('[Add date]' + startDateRequest);
    logger.debug('[Add date]' + endDateRequest);
    this.addMeasurement(JSON.parse(startDateRequest), false);
    this.addMeasurement(JSON.parse(endDateRequest), false);
}

/**
 *  Get measurements for specified sensor in this timeframe
 *
 * @param sensorName   {string} Name of the sensor
 * @param startDate    {string}
 * @param endDate      {string}
 * @return             {object} Object with measurements from specified sensor
 */
DataHandler.prototype.getMeasurement = function (sensorName, startDate, endDate) {
    var measurementStoreStr = "M" + nameFriendly(String(sensorName));
    
    // Create dummy records for dates
    this.addDate(startDate, endDate);
    
    // Query the store
    var measuredRSet = this.base.search({
        "$from": measurementStoreStr,
        "Date": [{ "$gt": String(startDate) }, { "$lt": String(endDate) }]
    });

    var dataObj = [];
    
    for (var i = 0; i < measuredRSet.length; i++) {
        dataObj.push({ 'Val': measuredRSet[i].Val, 'Timestamp': measuredRSet[i].Time.toISOString().replace(/Z/, '') });
    }

    return dataObj;
}

/**
 *  Get measurements from specified store
 *
 * @param req  {model:express~Request}   Request
 * @param res  {model:express~Response}  Response  
 */
DataHandler.prototype.handleGetMeasurement = function (req, res) {
    var sensorName = req.query.name;
    var startDate = req.query.startdate;
    var endDate = req.query.enddate;

    var data = this.getMeasurement(sensorName, startDate, endDate);
    res.status(200).json(data);
}

/**
 *  Get measurements from multiple stores
 *
 * @param req  {model:express~Request}   Request
 * @param res  {model:express~Response}  Response  
 */
DataHandler.prototype.handleNGetMeasurement = function (req, res) {
    var sensorListStr = req.query.name;
    var sensorList = sensorListStr.split(",");
    var dataObj = [];
    logger.debug('[NGetMeasurement] ' + sensorList);

    // Dates
    var startDate = req.query.startdate;
    var endDate = req.query.enddate;

    for (var i = 0; i < sensorList.length; i++) {
        var sensorName = sensorList[i];
        var data = this.getMeasurement(sensorName, startDate, endDate)
        dataObj.push({ "name": sensorName, "data": data });
    }

    res.status(200).json(dataObj);
}

/**
 * Modify string to alpha numeric
 *
 * @param myName  {String}  input
 * @return        {String}  alpha-numeric representation of input   
 */
function nameFriendly(myName) {
    return myName.replace(/\W/g, '');
}



module.exports = DataHandler;
