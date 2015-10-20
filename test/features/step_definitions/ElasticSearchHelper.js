var elasticsearch = require('elasticsearch');
var config = {
    "stdout": {
        "type": "stdout",
        "level": "debug"
    },
    "logstash": {
        "type": "logstash",
        "host": "192.168.33.11",
        "port": "4560",
        "level": "debug"
    }
};

var elasticSearchHelper = new function () {

    var getClient = function () {
        var elasticSearchHost = config.get("logstash.host") + ":9200";
        if (elasticSearchHost == null) {
            callback.fail("Not found config for logstash host");
        }
        var client = new elasticsearch.Client({
            host: elasticSearchHost,
            log: 'error'
        });
        return client;
    }

    var timeout = function (timeMs) {
        var end = Date.now() + timeMs;
        while (Date.now() < end) ;
    }

    this.search = function (message) {
        timeout(5000);
        return getClient().search({
            method: "get",
            q: 'message:' + message
        });
    }

};
module.exports = elasticSearchHelper;