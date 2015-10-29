var qm = require("qminer");
var assert = require('assert');

// Set verbosity of QMiner internals
qm.verbosity(0);

// test if NODE_ENV is set to "test"
describe('Testing NODE_ENV', function () {
    it('should be set to "test"', function () {
        assert.equal(process.env.NODE_ENV, "test")
    });
})