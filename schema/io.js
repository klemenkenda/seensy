// general includes
var fs = require('qminer').fs;
var logger = require('../modules/logger/logger.js');
require('../server/handlers/config.js')

var Utils = {};
Utils.Sensor = require("../server/utils/sensor.js");

exports.saveStreamAggrs = function (base, dir) {
    // initialize fout
    var fout = new fs.FOut(dir + '/streamAggregates.bin');
    // go through all measurement stores
    base.store("Sensor").each(function (rec) {
        var measurementStoreStr = "M" + Utils.Sensor.nameFriendly(rec.Name);
        var measurementStore = base.store(measurementStoreStr);
        var aggrList = measurementStore.getStreamAggrNames();
        
        console.log(measurementStoreStr);

        aggrList.forEach(function (saName) {
            var streamAggr = measurementStore.getStreamAggr(saName);            
            streamAggr.save(fout);
        });
    });
    
    fout.close();
}

exports.loadStreamAggrs = function (base, dir) {
    // initialize fin
    var fIn = new fs.FIn(dir + '/streamAggregates.bin');

    base.store("Sensor").each(function (rec) {
        var measurementStoreStr = "M" + Utils.Sensor.nameFriendly(rec.Name);
        var measurementStore = base.store(measurementStoreStr);
        
        console.log(measurementStoreStr);

        // go through aggregates
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
    });

    fIn.close();
};