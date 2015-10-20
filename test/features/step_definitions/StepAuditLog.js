var should = require('should');
var elasticSearchHelper = require('./ElasticSearchHelper');

var myStepDefinitionsWrapper = function () {

    this.World = require("../support/world.js").World; // overwrite default World constructor

    this.Given(/^a logger LoggerFactory$/, function (callback) {
        this.factory = this.loggerFactory.getLogger('test', true);
        if (this.factory == null) {
            callback.fail(new Error("No se ha definido el LoggerFactory correctamente"));
        } else {
           setTimeout(callback, 2000);
        }
        callback();
    });

    this.Given(/^a message "([^"]*)"$/, function (message, callback) {
        this.message = message + new Date().getTime();
        callback();
    });

    this.Given(/^Audit Service is not available$/, function (callback) {
        this.factory.streams[1].stream=null;
        callback();
    });

    this.When(/^called to log it$/, function (callback) {
        try{
            this.factory.info(this.message);
            callback();
        }catch(err) {
            this.logError = err;
            callback();
        }
    });

    this.Then(/^I get a Logging error$/, function (callback) {
        //console.log("Log error: " + this.logError);
        should.exist(this.logError);
        this.logError = null;
        callback();
    });


    this.Then(/^log without error$/, function (callback) {
        callback();
    });


    this.Then(/^I check that has been logged$/, function (callback) {
            return elasticSearchHelper.search(this.message).then(function (resp) {
                console.log(resp);
                var hits = resp.hits.hits;
                hits.length.should.be.above(0);
                callback();
            }, function (err) {
                callback.fail(err.message);
            });
        }
    );


};
module.exports = myStepDefinitionsWrapper;