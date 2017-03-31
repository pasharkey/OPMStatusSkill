"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Alexa = require("alexa-sdk");
var https = require("https");
var moment = require("moment");
var APP_ID = "my_alexa_id"; //update this for deployment on AWS Lambda
var handlers = {
    "LaunchRequest": function () {
        var self = this;
        var speechOutput = "Welcome to o. p. m. status. Please say a valid o. p. m. status command.";
        var rePrompt = "Please say a valid o. p. m. status command or help if you need assistance.";
        self.emit(":askWithCard", speechOutput, rePrompt, "OPM Status", speechOutput);
    },
    "AMAZON.HelpIntent": function () {
        var self = this;
        var intentRequest = self.event.request;
        var speechOutput = "To begin, ask o. p. m. status an acceptable question. For example, " +
            "Alexa, ask o. p. m. status if the government is open today, or, Alexa, " +
            "ask o. p. m. status was the government open on 2017-03-14?";
        self.emit(":askWithCard", speechOutput, speechOutput, "OPM Status", speechOutput);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        var speechOutput = "Goodbye!";
        this.emit(":tellWithCard", speechOutput, "OPM Status", speechOutput);
    },
    "Unhandled": function () {
        var self = this;
        var speechOutput = "Welcome to o. p. m. status. Please say a valid o. p. m. status command.";
        var rePrompt = "Please say a valid o. p. m. status command or help if you need assistance.";
        self.emit(":askWithCard", speechOutput, rePrompt, "OPM Status", speechOutput);
    },
    "AboutIntent": function () {
        var self = this;
        var speechOutput = "The creator of this Alexa skill is Patrick Sharkey";
        self.emit(":tellWithCard", speechOutput, "OPM Status", speechOutput);
    },
    "OpmStatusDefaultIntent": function () {
        var self = this;
        var currDt = moment().format('MM/DD/YYYY');
        //call OPM API to get status
        httpsGet(currDt, "ShortStatusMesage", function (reqResult) {
            self.emit(":tellWithCard", reqResult, "OPM Status for " + currDt, reqResult);
        });
    },
    "OpmStatusDateIntent": function () {
        var self = this;
        var intentRequest = self.event.request;
        var dtValue = intentRequest.intent.slots.date.value;
        console.log("dtValue = " + dtValue);
        //validate date coming from Alexa
        if (moment(dtValue, "YYYY-MM-DD").isValid()) {
            var opmDt = moment(dtValue).format('MM/DD/YYYY');
            //call OPM API to get status
            httpsGet(dtValue, "StatusType", function (reqResult) {
                var speechResponse = "Federal agencies in the Washington, DC, area were " + reqResult +
                    " on " + dtValue + ".";
                self.emit(":tellWithCard", speechResponse, "OPM Status for " + dtValue, speechResponse);
            });
        }
        else {
            var speechError = "I did not understand the date " + dtValue + ", please try again.";
            self.emit(":tellWithCard", speechError, "OPM Status for " + dtValue, speechError);
        }
    }
};
/**
 * Bootstrap for Alexa
 */
var Handler = (function () {
    function Handler(event, context, callback) {
        var alexa = Alexa.handler(event, context);
        alexa.APP_ID = APP_ID;
        alexa.registerHandlers(handlers);
        alexa.execute();
    }
    return Handler;
}());
exports.Handler = Handler;
/**
 * Helper Request Function
 */
function httpsGet(alexaDt, item, callback) {
    // OPM API request details
    var options = {
        host: 'www.opm.gov',
        path: '/json/operatingstatus.json?date=' + encodeURIComponent(alexaDt),
        method: 'GET',
        port: 443
    };
    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        var returnData = "";
        res.on('data', function (chunk) {
            returnData = returnData + chunk;
        });
        res.on('end', function () {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            var status = "";
            switch (item) {
                case "ShortStatusMessage": {
                    status = JSON.parse(returnData).ShortStatusMessage;
                    break;
                }
                case "StatusType": {
                    status = JSON.parse(returnData).StatusType;
                    break;
                }
                default: {
                    status = JSON.parse(returnData).ShortStatusMessage;
                    break;
                }
            }
            callback(status); // this will execute whatever function the caller defined, with one argument
        });
    });
    req.on('error', function (e) {
        // General error, i.e.
        //  - ECONNRESET - server closed the socket unexpectedly
        //  - ECONNREFUSED - server did not listen
        //  - HPE_INVALID_VERSION
        //  - HPE_INVALID_STATUS
        //  - ... (other HPE_* codes) - server returned garbage
        console.log(e);
        callback("Error occured when calling the OPM status API");
    });
    req.on('timeout', function () {
        // Timeout happend. Server received request, but not handled it
        // (i.e. doesn't send any response or it took to long).
        // You don't know what happend.
        // It will emit 'error' message as well (with ECONNRESET code).
        console.log('timeout occurred');
        req.abort();
        callback("Timeout occured when trying to contact OPM status API");
    });
    req.setTimeout(5000);
    req.end();
}
