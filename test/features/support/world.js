'use strict';

function World(callback) {
    this.service = null;
    this.requestId=null;
    this.response = null;
    callback();
}
module.exports.World = World;