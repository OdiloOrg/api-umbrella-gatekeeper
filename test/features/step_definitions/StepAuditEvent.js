var should = require('should');
var elasticSearchHelper=require('./ElasticSearchHelper');

var myStepDefinitionsWrapper = function () {

    this.World = require("../support/world.js").World;

    var event = {};

    this.Given(/^an audit logger LoggerFactory$/, function (callback) {

        this.factory = this.loggerFactory.getLogger('test', true);
        if(this.factory == null) {
            callback.fail(new Error("No se ha definido el LoggerFactory correctamente"));
        } else {
           setTimeout(callback, 2000);
        }
        callback();
    });

    this.Given(/^an audit event wit user "([^"]*)", operation "([^"]*)", resource with id "([^"]*)" and type "([^"]*)"$/, function (user, operation, resourceId, resourceType, callback) {
        event.user = user;
        event.resourceID = resourceId;
        event.resourceType = resourceType;
        event.operation = operation;
        callback();
    });

    this.When(/^audit service is called$/, function (callback) {
        this.message="Auditoria"+ new Date().getTime();
        try{
            this.factory.info({audit: event},this.message);
        }catch(err) {
            this.logError = err;
        }finally{
            callback();
        }
        callback();
    });

    this.Then(/^receive a sucessfull audit event response$/, function (callback) {
        callback();
    });

    this.Given(/^audit event service is not available$/, function (callback) {
        this.factory.streams[1].stream=null;
        callback();
    });

    this.Then(/^I check that has been audit$/, function (callback) {
        console.log("Audit Message "+this.message);
        return elasticSearchHelper.search(this.message).then(function (resp) {
            console.log(resp);
            var hits = resp.hits.hits;
            hits.length.should.be.above(0);
            callback();
        }, function (err) {
            callback.fail(err.message);
        });
    });

};
module.exports = myStepDefinitionsWrapper;