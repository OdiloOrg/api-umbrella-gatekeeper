var gatekeeperHelper=require ('../../support/gatekeeper');

var hooks = function () {

    this.Before(function (callback) {
        callback();
    });

    this.After(function (callback) {
        callback();
    });

    this.registerHandler('BeforeFeatures', function (event, callback) {
        console.log("before features");
        gatekeeperHelper.startConfigLoader()
        return gatekeeperHelper.startGatekeeper(callback);
    });

    this.registerHandler('AfterFeatures', function (event, callback) {
        console.log("after features");

        return gatekeeperHelper.stopGatekeeper(callback);
    });

};

module.exports = hooks;