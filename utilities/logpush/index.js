var env = process.env.NODE_ENV || 'development';
var logger = require('../../modules/logger/logger.js');
var config = require('../../config.json')[env];
var http = require('http');
var fs = require('qminer').fs;

logger.info("Starting LOG push ...");

fList = fs.listFile(config.dataLogger.dir);
logger.debug(fList);

callback = function (response) {
    var str = ''
    response.on('data', function (chunk) {
        str += chunk;
        console.log("test" + str);
    });
    
    response.on('end', function () {
        console.log(str);
    });
}

http.get(config.dataService.server.root + '/data/add-measurement?data=', function (res) {
    console.log("Got response: " + res.statusCode);
    
    res.on("data", function (chunk) {
        console.log("BODY: " + chunk);
    });
}).on('error', function (e) {
    console.log("Got error: " + e.message);
});

http.get(config.dataService.server.root + '/data/add-measurement?data=', function (res) {
    console.log("Got response: " + res.statusCode);
    
    res.on("data", function (chunk) {
        console.log("BODY: " + chunk);
    });
}).on('error', function (e) {
    console.log("Got error: " + e.message);
}).end();

var request = require("request");

request(config.dataService.server.root + '/data/add-measurement?data=');


fList.forEach(function (item) {
    logger.debug(item);
    var fIn = fs.openRead(item);
    logger.info(fIn.length);
    var i = 0;

    fs.readLines(fIn,
        // onLine
        function (line) {
            i++;
            // console.log(i + "\r");
            var url = config.dataService.server.root + '/data/add-measurement?data=';
        logger.debug(url);
        
        var req = http.get(config.dataService.server.root + '/data/add-measurement?data=', function (res) {
            console.log("Got response: " + res.statusCode);
            
            res.on("data", function (chunk) {
                console.log("BODY: " + chunk);
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
        
        req.end();

        
        logger.debug("end req");
        },
        // onEnd
        function () {
            fIn.close();
        },
        // onError
        function () { }
    );
});
