var http = require('http')
var fs = require('fs')

var scriptArgs = (process.argv[2] == null) ? './log-test-new.txt' : process.argv[2];

fs.readFile(scriptArgs, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        //console.log('received data: ' + data);
        var url = "http://localhost:9611/data/add-measurement?data=" + encodeURIComponent(data);
        //console.log(data)
        console.log(url)
        
        http.get(url, function (res) {
            console.log("Got response: " + res.statusCode);
                
            res.on("data", function (chunk) {
                console.log("BODY: " + chunk);
            });
        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });
        
    } else {
        console.log(err);
    }

});

