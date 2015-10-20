'use strict';

require('shelljs/global');

global.should = require('chai').should();


var background = function () {

    this.Given(/^Odilo Audit Service is available$/, function (callback) {
        return exec('ping -c2 192.168.33.11', function (code, output) {
            should.equal(code,0,"Audit Service not available");
            callback();
        });

    });
};

module.exports = background;