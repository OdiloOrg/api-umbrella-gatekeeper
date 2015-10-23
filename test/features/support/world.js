'use strict';

function World(callback) {
    this.loggerFactory = require('odilo-audit-client-nodejs');
    this.logger = this.loggerFactory.getLogger('gatekeeper',true),
    //console.log(this.logger);
    this.service = null;
    this.request = null;
    this.response = null;
    callback();
}
module.exports.World = World;