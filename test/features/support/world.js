'use strict';

global.should = require('chai').should();

function World(callback) {
    this.loggerFactory = require('../../../lib/LoggerFactory');
    this.config = require('config');
    this.factory = null;
    this.message = null;
    this.logError = null;
    this.event = null;
    callback();
}
module.exports.World = World;