'use strict';

function World(callback) {
    this.loggerFactory = require('odilo-audit-client-nodejs');
    console.log(this.loggerFactory);
    this.config = require('../../config/audit_config');
    console.log(this.config);
    this.logger = null;
    this.message = null;
    this.logError = null;
    this.event = null;
    callback();
}
module.exports.World = World;