// general includes
var qm = require('qminer');
var logger = require('../../modules/logger/logger.js');

function SyncHandler(app, base) {
    logger.debug('Sync handler - INIT');
    this.app = app;
    this.base = base;
    this.namespace = '/data/';
}

SyncHandler.prototype.setupRoutes = function (app) {
    // custom handler setup
    // push-sync-stores - Push data from stores in a uniformly increasing timeline
    app.get(this.namespace + 'push-sync-stores', this.handlePushSyncStores.bind(this));
    // add - Generic store add function
    app.get(this.namespace + 'add', this.handleAdd.bind(this));
}

/**
 * Prepare data and send it to required url
 *
 * @param req  {model:express~Request}  Request
 * @param res  {model:express~Response}  Response
 */
SyncHandler.prototype.handlePushSyncStores = function (req, res) {
    // Get all the parameters
    var sensorListStr = req.query.sid;
    var sensorList = sensorListStr.split(",");
    var remoteURL = String(req.query.remoteURL);
    var lastTs = parseInt(req.query.lastts);
    var prediction = 0;
    var maxitems = 1000;
    if (parseInt(req.query.prediction) == 1) prediction = 1;
    if (parseInt(req.query.maxitems) > 0) maxitems = parseInt(req.query.maxitems);

    // convert TS to QM date for query (-1 day)
    var timeFromEpoch = 0;
    if (lastTs - 24 * 60 * 60 > 0) {
        timeFromEpoch = (lastTs - 24 * 60 * 60) * 1000;
    }
    var lastTm = new Date(timeFromEpoch);
    logger.debug(lastTm.toISOString().replace(/Z/, ''));
    var startDateStr = lastTm.toISOString().replace(/Z/, '');

    // Add the dummy dates
    this.

    res.status(200).send('Done');
}

/**
 * Get and add data
 *
 * @param req  {model:express~Request}  Request
 * @param res  {model:express~Response}  Response
 */
SyncHandler.prototype.handleAdd = function (req, res) {
    var storeStr = String(req.query.store);
    var store = this.base.store(storeStr);

    // If the store doesn't exist
    if (store == null) {
        // M-sensorname --> measurements
        if (storeStr.substr(0, 1) == "M") {
            store = this.base.createStore([{
                "name": storeStr,
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
        } else if (storeStr.substr(0, 1) == "A") {
            var aggregateStoreDef = getAggregateStoreStructure(storeStr);
            store = this.base.createStore([aggregateStoreDef]);
        }
    };

    // Parse and add the record
    var record = JSON.parse(req.query.data);
    var responseStr;

    if ((store.empty) || (record.Time > store.last.Time.toISOString().replace(/Z/, ''))) {
        store.push(record);
        responseStr = "OK";
        logger.debug(responseStr);
    } else {
        responseStr = "Time problem: " + record.Time + " - store time: " + store.last.Time.string;
        logger.debug(responseStr);
    }
    res.status(200).send(responseStr);
}

module.exports = SyncHandler;