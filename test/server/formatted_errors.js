'use strict';

require('../test_helper');

var Factory = require('factory-lady'),
    request = require('request'),
    xml2js = require('xml2js');

describe('formatted error responses', function() {
  describe('format detection', function() {
    shared.runServer();

    it('places the highest priority on the path extension', function(done) {
      var options = { headers: { 'Accept': 'application/json' } };
      request.get('http://localhost:9333/hello.xml?format=json', options, function(error, response, body) {
        body.should.include('<code>API_KEY_MISSING</code>');
        done();
      });
    });

    it('places second highest priority on the format query param', function(done) {
      var options = { headers: { 'Accept': 'application/json' } };
      request.get('http://localhost:9333/hello?format=xml', options, function(error, response, body) {
        body.should.include('<code>API_KEY_MISSING</code>');
        done();
      });
    });

    it('places third highest priority on content negotiation', function(done) {
      var options = { headers: { 'Accept': 'application/json;q=0.5,application/xml;q=0.9' } };
      request.get('http://localhost:9333/hello', options, function(error, response, body) {
        body.should.include('<code>API_KEY_MISSING</code>');
        done();
      });
    });

    it('defaults to JSON when no format is detected', function(done) {
      request.get('http://localhost:9333/hello', function(error, response, body) {
        var data = JSON.parse(body);
        data.error.code.should.eql('API_KEY_MISSING');
        done();
      });
    });

    it('defaults to JSON when an unsupoorted format is detected', function(done) {
      request.get('http://localhost:9333/hello.mov', function(error, response, body) {
        var data = JSON.parse(body);
        data.error.code.should.eql('API_KEY_MISSING');
        done();
      });
    });

    it('defaults to JSON when an unknown format is detected', function(done) {
      request.get('http://localhost:9333/hello.zzz', function(error, response, body) {
        var data = JSON.parse(body);
        data.error.code.should.eql('API_KEY_MISSING');
        done();
      });
    });

    it('uses the path extension even if the url contains invalid query params', function(done) {
      var options = { headers: { 'Accept': 'application/json' } };
      request.get('http://localhost:9333/hello.xml?format=json&test=test&url=%ED%A1%BC', options, function(error, response, body) {
        body.should.include('<code>API_KEY_MISSING</code>');
        done();
      });
    });

    it('gracefully handles query param encoding, format[]=xml', function(done) {
      request.get('http://localhost:9333/hello?format[]=xml', function(error, response, body) {
        body.should.include('<code>API_KEY_MISSING</code>');
        done();
      });
    });

    it('gracefully handles query param encoding, format=xml&format=csv', function(done) {
      request.get('http://localhost:9333/hello?format=xml&format=csv', function(error, response, body) {
        var data = JSON.parse(body);
        data.error.code.should.eql('API_KEY_MISSING');
        done();
      });
    });

    it('gracefully handles query params encoding, format[key]=value', function(done) {
      request.get('http://localhost:9333/hello?format[key]=value', function(error, response, body) {
        var data = JSON.parse(body);
        data.error.code.should.eql('API_KEY_MISSING');
        done();
      });
    });

    it('gracefully handles query params encoding, format[]=', function(done) {
      request.get('http://localhost:9333/hello?format[]=', function(error, response, body) {
        var data = JSON.parse(body);
        data.error.code.should.eql('API_KEY_MISSING');
        done();
      });
    });
  });

  describe('data variables', function() {
    shared.runServer();

    it('substitutes the baseUrl variable', function(done) {
      Factory.create('api_user', { disabled_at: new Date() }, function(user) {
        request.get('http://localhost:9333/hello.json?api_key=' + user.api_key, function(error, response, body) {
          var data = JSON.parse(body);
          data.error.message.should.include(' http://localhost:9333/contact ');
          done();
        });
      });
    });
  });

  describe('format validation', function() {
    shared.runServer({
      apiSettings: {
        error_templates: {
          json: '\n\n{ "code": {{code}} }\n\n',
          xml: '\n\n   <?xml version="1.0" encoding="UTF-8"?><code>{{code}}</code>\n\n   ',
        },
      },
    });

    it('returns valid json', function(done) {
      request.get('http://localhost:9333/hello.json?format=json', function(error, response, body) {
        var validate = function() {
          JSON.parse(body);
        };

        validate.should.not.throw(Error);
        done();
      });
    });

    it('returns valid xml', function(done) {
      request.get('http://localhost:9333/hello.xml?format=json', function(error, response, body) {
        var validate = function() {
          xml2js.parseString(body, { trim: false, strict: true });
        };

        validate.should.not.throw(Error);
        done();
      });
    });

    it('strips leading and trailing whitespace from template', function(done) {
      request.get('http://localhost:9333/hello.xml?format=json', function(error, response, body) {
        body.should.eql('<?xml version="1.0" encoding="UTF-8"?><code>API_KEY_MISSING</code>');
        done();
      });
    });
  });

  describe('api specific templates', function() {
    shared.runServer({
      apis: [
        {
          frontend_host: 'localhost',
          backend_host: 'example.com',
          url_matches: [
            {
              frontend_prefix: '/custom/',
              backend_prefix: '/custom/',
            }
          ],
          settings: {
            error_templates: {
              json: '{ "code": {{code}}, "message": {{message}}, "custom": "custom hello", "newvar": {{newvar}} }',
            },
            error_data: {
              api_key_missing: {
                newvar: 'foo',
                message: 'new message',
              },
            },
          },
        },
        {
          frontend_host: 'localhost',
          backend_host: 'example.com',
          url_matches: [
            {
              frontend_prefix: '/',
              backend_prefix: '/',
            }
          ],
        },
      ],
    });

    it('returns custom error templates', function(done) {
      request.get('http://localhost:9333/custom/hello.json', function(error, response, body) {
        var data = JSON.parse(body);
        data.custom.should.eql('custom hello');
        done();
      });
    });

    it('allows new variables to be set while still inheriting default variables', function(done) {
      request.get('http://localhost:9333/custom/hello.json', function(error, response, body) {
        var data = JSON.parse(body);
        data.newvar.should.eql('foo');
        data.message.should.eql('new message');
        data.code.should.eql('API_KEY_MISSING');
        done();
      });
    });

    it('uses the default error templates if not specified', function(done) {
      request.get('http://localhost:9333/hello.json', function(error, response, body) {
        var data = JSON.parse(body);
        Object.keys(data).should.eql(['error']);
        Object.keys(data.error).sort().should.eql(['code', 'message']);
        done();
      });
    });
  });

  describe('invalid data', function() {
    shared.runServer({
      apis: [
        {
          frontend_host: 'localhost',
          backend_host: 'example.com',
          url_matches: [
            {
              frontend_prefix: '/',
              backend_prefix: '/',
            }
          ],
          settings: {
            error_data: {
              api_key_missing: 'Foo',
              api_key_invalid: 9,
              api_key_unauthorized: [],
              api_key_disabled: null,
            },
          },
          sub_settings: [
            {
              http_method: 'any',
              regex: '^/private',
              settings: {
                required_roles: ['private'],
              },
            },
          ],
        },
      ],
    });

    it('returns internal error when error data is unexpectedly a string', function(done) {
      request.get('http://localhost:9333/hello.json', function(error, response, body) {
        response.statusCode.should.eql(500);
        var data = JSON.parse(body);
        data.error.code.should.eql('INTERNAL_SERVER_ERROR');
        done();
      });
    });

    it('returns internal error when error data is unexpectedly a number', function(done) {
      request.get('http://localhost:9333/hello.json?api_key=invalid-key', function(error, response, body) {
        response.statusCode.should.eql(500);
        var data = JSON.parse(body);
        data.error.code.should.eql('INTERNAL_SERVER_ERROR');
        done();
      });
    });

    it('returns internal error when error data is unexpectedly an array', function(done) {
      request.get('http://localhost:9333/private.json?api_key=' + this.apiKey, function(error, response, body) {
        response.statusCode.should.eql(500);
        var data = JSON.parse(body);
        data.error.code.should.eql('INTERNAL_SERVER_ERROR');
        done();
      });
    });

    it('returns default error data when the error data is null', function(done) {
      Factory.create('api_user', { disabled_at: new Date() }, function(user) {
        request.get('http://localhost:9333/hello.json?api_key=' + user.api_key, function(error, response, body) {
          response.statusCode.should.eql(500);
          var data = JSON.parse(body);
          data.error.code.should.eql('INTERNAL_SERVER_ERROR');
          done();
        });
      });
    });
  });

  describe('invalid templates', function() {
    shared.runServer({
      apis: [
        {
          frontend_host: 'localhost',
          backend_host: 'example.com',
          url_matches: [
            {
              frontend_prefix: '/',
              backend_prefix: '/',
            }
          ],
          settings: {
            error_templates: {
              json: '{ "unknown": {{bogusvar}} }',
              xml: '<invalid>{{oops}</invalid>',
            },
            error_data: {
              api_key_missing: {
                newvar: 'foo',
                message: 'new message',
              },
            },
          },
        },
      ],
    });

    it('returns empty space when variables are undefined', function(done) {
      request.get('http://localhost:9333/hello.json', function(error, response, body) {
        body.should.eql('{ "unknown":  }');
        done();
      });
    });

    it('doesn\'t die when there are parsing errors in the template', function(done) {
      request.get('http://localhost:9333/hello.xml', function(error, response, body) {
        response.statusCode.should.eql(500);
        body.should.eql('Internal Server Error');
        done();
      });
    });
  });
});
