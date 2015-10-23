var chai = require('chai'),
    should = chai.should(),
    elasticSearchHelper = require('./ElasticSearchHelper'),
    request = require('request');

var myStepDefinitionsWrapper = function () {

    this.World = require("../support/world.js").World; // overwrite default World constructor

    //this.Given(/^a logger LoggerFactory$/, function (callback) {
    //    //this.logger = this.loggerFactory.getLogger('test', true);
    //    if (this.logger == null) {
    //        callback.fail(new Error("No se ha definido el LoggerFactory correctamente"));
    //    } else {
    //        setTimeout(callback, 2000);
    //    }
    //    callback();
    //});
    //
    //this.Given(/^a message "([^"]*)"$/, function (message, callback) {
    //    this.message = message + new Date().getTime();
    //    callback();
    //});
    //
    //this.Given(/^Audit Service is not available$/, function (callback) {
    //    this.logger.streams[1].stream = null;
    //    callback();
    //});
    //
    //this.When(/^called to log it$/, function (callback) {
    //    try {
    //        this.logger.info(this.message);
    //        callback();
    //    } catch (err) {
    //        this.logError = err;
    //        callback();
    //    }
    //});
    //
    //this.Then(/^I get a Logging error$/, function (callback) {
    //    //console.log("Log error: " + this.logError);
    //    should.exist(this.logError);
    //    this.logError = null;
    //    callback();
    //});


    this.Given(/^I want to call (.*)$/, function (service, callback) {
        service.should.be.not.null;
        this.service = service;
        callback();
    });

    this.When(/^I call it with "([^"]*)"$/, function (req, callback) {
        var options = {};
        request.get('http://localhost:9333/' + this.service, options, function (error, response, body) {
            response.should.be.not.null;
            this.body = body;
            callback();
        });
    });

    this.Then(/^I check that "([^"]*)" has been audited$/, function (response, callback) {
        return elasticSearchHelper.search(this.config, this.message).then(function (resp) {
            var hits = resp.hits.hits;
            hits.length.should.be.above(0);
            callback();
        }, function (err) {
            callback.fail(err.message);
        });
    });


};
module.exports = myStepDefinitionsWrapper;