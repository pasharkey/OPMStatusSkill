import * as Alexa from "alexa-sdk";
import * as https from "https";
import * as moment from "moment";

const APP_ID = "my_alexa_id"; //update this for deployment on AWS Lambda
 
let handlers: Alexa.Handlers = {
    "LaunchRequest": function () {
        let self: Alexa.Handler = this;
        let speechOutput = "Welcome to o. p. m. status. Please say a valid o. p. m. status command."
        let rePrompt = "Please say a valid o. p. m. status command or help if you need assistance."
        self.emit(":askWithCard", speechOutput, rePrompt, "OPM Status", speechOutput);
    },
    "AMAZON.HelpIntent": function() {
        let self: Alexa.Handler = this;
        let intentRequest = <Alexa.IntentRequest> self.event.request;
        let speechOutput = "To begin, ask o. p. m. status an acceptable question. For example, " +
                        "Alexa, ask o. p. m. status if the government is open today, or, Alexa, "+
                        "ask o. p. m. status was the government open on 2017-03-14?"
        self.emit(":askWithCard", speechOutput, speechOutput, "OPM Status", speechOutput);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        let speechOutput = "Goodbye!"
        this.emit(":tellWithCard", speechOutput, "OPM Status", speechOutput);
    },
    'LaunchIntent':function () {
        this.emit('LaunchRequest');
    },
    "Unhandled": function () {
        let self: Alexa.Handler = this;
        let speechOutput = "Welcome to o. p. m. status. Please say a valid o. p. m. status command."
        let rePrompt = "Please say a valid o. p. m. status command or help if you need assistance."
        self.emit(":askWithCard", speechOutput, rePrompt, "OPM Status", speechOutput);
    },
    "AboutIntent": function() {
        let self: Alexa.Handler = this;
        let speechOutput = "The creator of this Alexa skill is Patrick Sharkey";
        self.emit(":tellWithCard", speechOutput, "OPM Status", speechOutput);
    },
    "OpmStatusDefaultIntent": function() {
        let self: Alexa.Handler = this;
        let currDt = moment().format('MM/DD/YYYY');
    
        //call OPM API to get status
        httpsGet(currDt, "ShortStatusMesage", reqResult => {
            self.emit(":tellWithCard", reqResult, "OPM Status for " + currDt, reqResult); 
        });       
    },
    "OpmStatusDateIntent": function() {
        let self: Alexa.Handler = this;
        let intentRequest = <Alexa.IntentRequest> self.event.request;
        let dtValue = intentRequest.intent.slots.date.value;
        console.log("dtValue = " + dtValue);

        //validate date coming from Alexa
        if( moment(dtValue, "YYYY-MM-DD").isValid() ) {
            
            let opmDt = moment(dtValue).format('MM/DD/YYYY');

            //call OPM API to get status
            httpsGet(dtValue, "StatusType", reqResult => {
                let speechResponse = "Federal agencies in the Washington, DC, area were " + reqResult + 
                                     " on " + dtValue + ".";
                self.emit(":tellWithCard", speechResponse, "OPM Status for " + dtValue, speechResponse); 
            }); 
        } else {
             let speechError = "I did not understand the date " + dtValue + ", please try again.";
             self.emit(":tellWithCard", speechError, "OPM Status for " + dtValue, speechError); 
        }   
    }
}

/**
 * Bootstrap for Alexa
 */
export class Handler {
    constructor(event: Alexa.RequestBody, context: Alexa.Context, callback: Function) {
        let alexa = Alexa.handler(event, context);
        alexa.APP_ID = APP_ID;
        alexa.appId = APP_ID;
        alexa.registerHandlers(handlers);
        alexa.execute();
    }
}

/**
 * Helper Request Function
 */
function httpsGet(alexaDt, item, callback) {

    // OPM API request details
    let options = {
        host: 'www.opm.gov',
        path: '/json/operatingstatus.json?date=' + encodeURIComponent(alexaDt),
        method: 'GET',
        port: 443
    };

    let req = https.request(options, res => {
        res.setEncoding('utf8');
        let returnData = "";

        res.on('data', chunk => {
            returnData = returnData + chunk;
        });

        res.on('end', () => {
            // we have now received the raw return data in the returnData variable.
            // We can see it in the log output via:
            // console.log(JSON.stringify(returnData))
            // we may need to parse through it to extract the needed data
            let status = "";

            switch(item) { 
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

            callback(status);  // this will execute whatever function the caller defined, with one argument
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