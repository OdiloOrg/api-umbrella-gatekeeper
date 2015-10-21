var gatekeeperHelper=require ('../../support/gatekeeper');

global.should = require('chai').should();

var hooks = function () {

    this.Before(function (callback) {
        callback();
    });

    this.After(function (callback) {
        callback();
    });

    this.registerHandler('BeforeFeatures', function (event, callback) {
        console.log("before features");
        return gatekeeperHelper.startGatekeeper(callback);
    });

    this.registerHandler('AfterFeatures', function (event, callback) {
        console.log("after features");
        //return gatekeeperHelper.stopGatekeeper(callback);
        callback();
    });

};

module.exports = hooks;