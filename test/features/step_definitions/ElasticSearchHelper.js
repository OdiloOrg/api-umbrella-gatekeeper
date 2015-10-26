var elasticsearch = require('elasticsearch');
var config = require('../../../config/default');

var elasticSearchHelper = new function () {

    var getClient = function () {
        var elasticSearchHost = config['logstash']['host'] + ":9200";
        if (elasticSearchHost == null) {
            callback.fail("Not found config for logstash host");
        }
        var client = new elasticsearch.Client({
            host: elasticSearchHost,
            log: 'debug'
        });
        return client;
    }

    var timeout = function (timeMs) {
        var end = Date.now() + timeMs;
        while (Date.now() < end) ;
    }

    this.search = function (config, message) {
        timeout(5000);
        return getClient(config).search({
            method: "get",
            q: 'message:' + message
        });
    }

    this.searchReqUrl = function (config, url) {
        return getClient(config).search({
            method: "post",
            query: {
                "bool": {

                    "must": [
                        {
                            "term": {
                                "audit.req_url.raw": url
                            }
                        }
                    ]
                }
            }
        });
    }

};
module.exports = elasticSearchHelper;