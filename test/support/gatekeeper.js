'use strict';

var _ = require('lodash'),
    apiUmbrellaConfig = require('api-umbrella-config'),
    gatekeeper = require('../../lib/gatekeeper'),
    csv = require('csv'),
    Factory = require('factory-lady'),
    fs = require('fs'),
    ippp = require('ipplusplus'),
    path = require('path'),
    request = require('request'),
    xml2js = require('xml2js'),
    yaml = require('js-yaml');

global.backendCalled = false;
global.autoIncrementingIpAddress = '10.0.0.0';

_.merge(global.shared, {
    buildRequestOptions: function (path, apiKey, options) {
        return _.extend({
            url: 'http://localhost:9333' + path,
            qs: {api_key: apiKey},
        }, options);
    },
});
//console.log('inside gatekeper');

module.exports = {

    startConfigLoader: function (done) {
        //this.timeout(5000);
        //var overridesPath = path.resolve(__dirname, '../config/overrides.yml');
        //fs.writeFileSync(overridesPath, yaml.dump(configOverrides || {}));

        apiUmbrellaConfig.loader({
            paths: [
                path.resolve(__dirname, '../../config/default.yml'),
                path.resolve(__dirname, '../config/test.yml'),
            ]
            //overrides: configOverrides,
        }, function (error, loader) {
            done(error,loader);
        }.bind(this));
    },

    createDefaultApiUser: function (done) {
        global.autoIncrementingIpAddress = ippp.next(global.autoIncrementingIpAddress);
        this.ipAddress = global.autoIncrementingIpAddress;

        Factory.create('api_user', function (user) {
            this.user = user;
            this.apiKey = user.api_key;
            this.options = {
                headers: {
                    'X-Api-Key': this.apiKey,
                }
            };
            done();
        }.bind(this));
    },

    startGatekeeper: function (done) {
        return this.startConfigLoader(function (err,loader) {
            if (err != null){
                done(err);
            }
            gatekeeper.start({
                config: loader.runtimeFile,
            }, done);
        });
    },

    stopConfigLoader: function (done) {
        if (this.loader) {
            this.loader.close(done);
        }
    },

    stopGatekeeper: function (done) {
        if (this.gatekeeper) {
            this.gatekeeper.close(done);
        }
    }

};