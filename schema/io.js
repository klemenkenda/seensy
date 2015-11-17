var fs = require('qminer').fs;
var path = require('path');
var logger = require('../modules/logger/logger.js');
var createBase = require('./create.js');
var env = process.env.NODE_ENV || 'development';
var config = require('../config.json')[env];
var ncp = require('ncp').ncp;
require('../server/handlers/config.js');

var Utils = {};
Utils.Sensor = require("../server/utils/sensor.js");

function saveStreamAggrs(base, dir) {
    var dataObj = [];

    // Default value is __dirname
    dir = typeof dir !== 'undefined' ? dir : __dirname;

    // Go through all measurement stores
    base.store("Sensor").each(function (rec) {
        var measurementStoreStr = "M" + Utils.Sensor.nameFriendly(rec.Name);
        var measurementStore = base.store(measurementStoreStr);
        var aggrList = measurementStore.getStreamAggrNames();
        
        logger.debug(measurementStoreStr);
        
        if (aggrList.length > 0) {
            // Initialize fout
            var fout = new fs.FOut(path.join(dir, './db/' + Utils.Sensor.nameFriendly(rec.Name) + '.bin'));
            // Write streamAggregate information to file
            aggrList.forEach(function (saName) {
                var streamAggr = measurementStore.getStreamAggr(saName);
                streamAggr.save(fout);
            });

            // Close fout
            fout.close();

            // Add information to overview file
            dataObj.push({'sensorName': rec.Name})
        }        
    });

    // Write which sensors have stream aggregates
    var fout = new fs.FOut(path.join(dir, './db/streamAggregates.json'));
    fout.writeLine(JSON.stringify(dataObj));
    fout.close();
    
}

function loadStreamAggrs(base, dir) {
    // Default value is __dirname
    dir = typeof dir !== 'undefined' ? dir : __dirname;

    // Open information about which sensors have stream aggregates
    var fIn = new fs.FIn(path.join(dir, './db/streamAggregates.json'));
    var data = fIn.readLine();
    dataObj = JSON.parse(data)
    fIn.close()
    
    for (var i = 0; i < dataObj.length; i++) {
        var measurementStoreStr = "M" + Utils.Sensor.nameFriendly(dataObj[i].sensorName);
        var measurementStore = base.store(measurementStoreStr);
        
        // Open aggregates' information
        var fIn = new fs.FIn(path.join(dir, './db/' + Utils.Sensor.nameFriendly(dataObj[i].sensorName) + '.bin'));

        // Add a tick
        measurementStore.addStreamAggr({
            name: "tick", type: "timeSeriesTick",
            timestamp: "Time", value: "Val"
        });
        measurementStore.getStreamAggr("tick").load(fIn);

        // Adding tick based aggregates
        tickTimes.forEach(function (time) {
            tickAggregates.forEach(function (aggregate) {
                aggregateObj = {
                    name: aggregate.name + time.name, type: aggregate.type, inAggr: "tick",
                    emaType: "previous", interval: time.interval * 60 * 60 * 1000 - 1, initWindow: 0 * 60 * 1000
                };
                measurementStore.addStreamAggr(aggregateObj);
                measurementStore.getStreamAggr(aggregateObj.name).load(fIn);
            });
        });

        // Adding winbuff based aggregates
        bufTimes.forEach(function (time) {
            var bufname = 'winbuff' + time.name;
            // adding timeserieswinbuff aggregate
            measurementStore.addStreamAggr({
                name: bufname, type: "timeSeriesWinBuf",
                timestamp: "Time", value: "Val", winsize: time.interval * 60 * 60 * 1000 - 1
            });
            measurementStore.getStreamAggr(bufname).load(fIn);
            
            bufAggregates.forEach(function (aggregate) {
                aggregateObj = {
                    name: aggregate.name + time.name, type: aggregate.type, inAggr: bufname
                };
                measurementStore.addStreamAggr(aggregateObj);
                measurementStore.getStreamAggr(aggregateObj.name).load(fIn);
            })
        });
        
        // Close handle
        fIn.close()
    }

};

/**
 * Close Base
 *
 * @param base  {module:qm~Base}    
 */
function closeBase(base) {
    logger.info('[Main] Closing base ...');
    
    if (base != null) {
        logger.info('[Main] Closing ...');
        base.garbageCollect();
        base.close();
    }
    
    logger.info('[Main] Done!');
}

/**
 * Open base
 *
 * @param base  {module:qm~Base}    
 */
function openBase(open) {
    var base = createBase.mode(open);
    if (open == 'open') {
        loadStreamAggrs(base);
        logger.info('[Main] Loaded stream aggregates');
    }
    return base;
}

/**
 * Shutdown main application
 * 
 * @param base  {module:qm~Base}
 * @param app  {module:expressjs~App}
 */
function shutdown(base, server) {
    logger.info('[Main] Initiating shutdown');
    server.close(function () {  
        logger.info('[Main] Closed remaining connection');
        saveStreamAggrs(base);
        logger.info('[Main] Saved stream aggregates')
        closeBase(base);
        process.exit(0)
    });
}



/**
 * Backup the database
 * 
 * @param base  {module:qm~Base}
 * @param app  {module:expressjs~App}
 */
function backup(base, server) {
    // TODO: Send information about backup to the webserver
    logger.info('[Main] Initiating backup');
    server.close(function () {
        logger.info('[Main] Closed connection');
        saveStreamAggrs(base);
        logger.info('[Main] Saved stream aggregates')
        closeBase(base);
        // TODO: Zip files and back them up
        ncp(__dirname + './db/', __dirname + './backup/' + new Date().toISOString() + '/', function (err) { 
            logger.info('[Main] Backup finished')
            base = openBase('open');
            logger.info(base.getStoreList());
            server.listen(config.dataService.server.port);
            logger.info('[Server] Running on port http://localhost:%s/', config.dataService.server.port)
        });
    });
}

module.exports = {
    closeBase: closeBase,
    openBase: openBase,
    backup: backup,
    shutdown: shutdown,
    loadStreamAggrs: loadStreamAggrs,
    saveStreamAggrs: saveStreamAggrs,
}
