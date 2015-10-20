'use strict';

require('../test_helper');

var apiUmbrellaConfig = require('api-umbrella-config'),
    async = require('async'),
    forever = require('forever-monitor'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    path = require('path'),
    redis = require('redis'),
    net = require('net');

var config = apiUmbrellaConfig.load(path.resolve(__dirname, '../config/test.yml'));

mongoose.testConnection = mongoose.createConnection(config.get('mongodb.url'), config.get('mongodb.options'));

before(function mongoOpen(done) {
  mongoose.testConnection.on('connected', done);
});

before(function mongoDropDatabase(done) {
  this.timeout(5000);

  // Drop the whole database, since that properly blocks for any active
  // connections. The database will get re-created on demand. If this times
  // out, it's likely because there are active connections.
  mongoose.testConnection.db.dropDatabase(done);
});

// Spin up a new redis-server for running the test suite. Multiple database on
// the main instance would be an option, but that seems like it may become
// deprecated. This also ensures our tests don't accidentally step on a
// person's local usage of any random database on the main redis instance.
var redisServer;
var redisPidFile = path.resolve(__dirname, '../tmp/redis.pid');
before(function redisStart(done) {

  if(fs.existsSync(redisPidFile)) {
    var pid = fs.readFileSync(redisPidFile);
    if(pid) {
      forever.kill(pid, false, 'SIGKILL');
    }
  }

  // Spin up the redis-server process.
  redisServer = new (forever.Monitor)(['redis-server', '--port', config.get('redis.port')], {
    max: 1,
    silent: true,
    pidFile: redisPidFile,
  });

  var redisOutput = '';
  redisServer.on('stderr', function(data) {
    redisOutput += data.toString();
  });

  redisServer.on('stdout', function(data) {
    redisOutput += data.toString();
  });

  // Make sure the redis-server process doesn't just quickly die on startup
  // (for example, if the port is already in use).
  var exitListener = function () {
    // Delay exiting, so stdout/stderr can be captured and displayed. I think
    // this is an odd-bug with forever-monitor, where the output gets weird on
    // immediate exits. Possibly related to similar oddities seen when trying
    // to use log files: https://github.com/nodejitsu/forever-monitor/issues/36
    setTimeout(function() {
      console.error('\nFailed to start redis server:');
      console.error(redisOutput);
      process.exit(1);
    }, 250);
  };
  redisServer.on('exit', exitListener);

  setTimeout(function() {
    if(exitListener) {
      redisServer.removeListener('exit', exitListener);
      exitListener = null;
    }
  }, 1000);

  redisServer.on('start', function(process, data) {
    fs.writeFileSync(redisPidFile, data.pid);

    // Wait until we're able to establish a connection before moving on.
    var connected = false;
    async.until(function() {
      return connected;
    }, function(callback) {
      net.connect({
        port: config.get('redis.port'),
      }).on('connect', function() {
        connected = true;
        callback();
      }).on('error', function() {
        setTimeout(callback, 20);
      });
    }, done);
  });
  //redisServer.start();
  done();
});

// Wipe the redis data.
before(function redisOpen(done) {
  global.redisClient = redis.createClient(config.get('redis.port'), config.get('redis.host'));
  global.redisClient.flushdb(function() {
    done();
  });
});

// Close the mongo connection cleanly after each run.
after(function mongoClose(done) {
  mongoose.testConnection.close(function() {
    done();
  });
});

after(function redisClose(done) {
  if(global.redisClient) {
    global.redisClient.quit(function() {
      //if(redisServer.running) {
      //  redisServer.on('exit', function() {
      //    done();
      //  });
      //
      //  redisServer.stop();
      //  fs.unlinkSync(redisPidFile);
      //} else {
      //  done();
      //}
    });
  }
  done();
});
