var chai = require('chai'),
    should = chai.should(),
    elasticSearchHelper = require('./ElasticSearchHelper'),
    request = require('request');

var myStepDefinitionsWrapper = function () {

    this.World = require("../support/world.js").World; // overwrite default World constructor

    var finalResponse = {};

    this.Given(/^I want to call (.*)$/, function (service, callback) {
        this.service=service;
        service.should.be.not.null;
        callback();
    });

    this.When(/^I call it$/, function (callback) {
        var options = {};
        this.requestId=new Date().getTime();
        this.request='http://localhost:9333/' + this.service+'/'+this.requestId;
        console.log(this.request);
        return request.get(this.request, options, function (error, response, body) {
            finalResponse=response;
            callback(error);
        });
    });

    this.Then(/^I check that it has been audited$/, function (callback) {
        return elasticSearchHelper.searchReqUrl(this.config, this.request).then(function (resp) {
            var hits = resp.hits.hits;
            hits.length.should.be.above(0);
            callback();
        }, function (err) {
            callback.fail(err.message);
        });
    });


};
module.exports = myStepDefinitionsWrapper;