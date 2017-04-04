const context = require("aws-lambda-mock-context")
var expect = require("chai").expect;
var index = require("../src/index");

const ctx = context();

/**
 * Test OpmStatus Date Intent
 */
describe("Testing the OpmStatusDateIntent with valid ISO date", function() {
    this.timeout(15000);
    var speechResponse = null;
    var speechError = null;

    before(function(done) {
        index.Handler({"session": {
            "new": true,
            "sessionId": "amzn1.echo-api.session.abaa",
            "attributes": {},
            "user": {
              "userId": null
            },
            "application": {
              "applicationId": "my_alexa_id"
            }
          },
          "version": "1.0",
          "request": {
            "locale": "en-US",
            "timestamp": "2016-10-27T21:06:28Z",
            "type": "IntentRequest",
            "requestId": "amzn1.echo-api.request.3938",
            "intent": {
              "slots": {
                "date": {
                  "name": "date",
                  "value": "2017-03-14"
                }
              },
              "name": "OpmStatusDateIntent"
            }
          },
          "locale":"en-US"
        }, ctx);
        ctx.Promise.then(response => { speechResponse = response; console.log(speechResponse); done(); })
                   .catch(error => { speechError = error; done(); })
    });

    describe("Is the response structrually correct", function() {
        it("should not have errored", function() {
            expect(speechError).to.be.null;
        })
    });
});