var logger = require('../../modules/logger/logger.js');

function DataHandler(base, app) {
    this.base = base;
    this.app = app;
}

// get router paths
DataHandler.prototype.handleGetRouterPaths = function (req, res) {
    var routerPaths = [];
    var test = this.app;
    this.app._router.stack.forEach(function (item) {
        if (item.route != undefined) {
            routerPaths.push({ "path": item.route.path, "methods": item.route.methods });
        }
    });
    res.json(routerPaths);
}

// close base
DataHandler.prototype.handleCloseBase = function (req, res) {
    try {
        this.base.close();
        res.status(200).json({ message: "Base closed" });
    }
    catch (err) {
        if (typeof err.message != 'undefined' && err.message == "[addon] Exception: Base is closed!") {
            res.status(500).json({ error: "Base is already closed" });
            logger.warn("Cannot close base. Base is already closed.");
        }
        else {
            res.status(500).json({ error: "Something went wrong when closing base." });
            logger.error(err.stack);
        }
    }
}

// exit
DataHandler.prototype.handleExit = function (req, res) {
    this.handleCloseBase(req, res);
    // TODO - is this OK???
    process.on('exit', function () { process.exit(0); });
    process.exit(1);
}

module.exports = DataHandler;