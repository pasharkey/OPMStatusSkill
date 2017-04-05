
from __future__ import print_function
import requests
import datetime

API_BASE="https://www.opm.gov/json/operatingstatus.json"
APP_ID="my_alexa_id"
 
def lambda_handler(event, context):
    """ Route the incoming request based on type (LaunchRequest, IntentRequest,
    etc.) The JSON body of the request is provided in the event parameter.
    """
    print("event.session.application.applicationId=" +
          event['session']['application']['applicationId'])
 
    """
    Uncomment this if statement and populate with your skill's application ID to
    prevent someone else from configuring a skill that sends requests to this
    function.
    """
    if (event['session']['application']['applicationId'] != APP_ID):
        raise ValueError("Invalid Application ID")
 
    if event['session']['new']:
        on_session_started({'requestId': event['request']['requestId']}, event['session'])
 
    if event['request']['type'] == "LaunchRequest":
        return on_launch(event['request'], event['session'])
    elif event['request']['type'] == "IntentRequest":
        return on_intent(event['request'], event['session'])
    elif event['request']['type'] == "SessionEndedRequest":
        return on_session_ended(event['request'], event['session'])
 
 
def on_session_started(session_started_request, session):
    """ Called when the session starts """
 
    print("on_session_started requestId=" + session_started_request['requestId']
          + ", sessionId=" + session['sessionId'])
 
 
def on_launch(launch_request, session):
    """ Called when the user launches the skill without specifying what they
    want
    """

    print("on_launch requestId=" + launch_request['requestId'] +
          ", sessionId=" + session['sessionId'])
    # Dispatch to your skill's launch
    return get_welcome_response()
 
 
def on_intent(intent_request, session):
    """ Called when the user specifies an intent for this skill """
 
    print("on_intent requestId=" + intent_request['requestId'] +
          ", sessionId=" + session['sessionId'])
 
    intent = intent_request['intent']
    intent_name = intent_request['intent']['name']
 
    # Dispatch to your skill's intent handlers
    if intent_name == "OpmStatusDefaultIntent":
        return get_current_opm_status_response(intent, session)
    elif intent_name == "OpmStatusDateIntent":
        return get_date_opm_status_response(intent, session)
    elif intent_name == "AboutIntent":
        return get_about_response()
    elif intent_name == "AMAZON.HelpIntent":
        return get_help_response()
    elif intent_name == "AMAZON.CancelIntent" or intent_name == "AMAZON.StopIntent":
        return handle_session_end_request()
    else:
        raise ValueError("Invalid intent")
 
 
def on_session_ended(session_ended_request, session):
    print("on_session_ended requestId=" + session_ended_request['requestId'] +
          ", sessionId=" + session['sessionId'])
    # add cleanup logic here
 
def handle_session_end_request():
    card_title = "OPM Status - Goodbye!"
    speech_output = "Thank you for using o. p. m. status!"
    reprompt_text = "Thank you for using o. p. m status! Feedback is always welcome. You can find me on Twitter at @shatparkey."
    # Setting this to true ends the session and exits the skill.
    should_end_session = True
    return build_response({}, build_speechlet_response(
        card_title, speech_output, reprompt_text, should_end_session))

# --------------- Functions that control the skill's behavior ------------------
 
def get_welcome_response():
    """ If we wanted to initialize the session to have some attributes we could
    add those here
    """
 
    session_attributes = {}
    card_title = "Welcome to OPM Status!"
    speech_output = "Welcome to o. p. m. status. " \
                    "Please ask me for a status by saying, " \
                    "Is the government open today?"
    # If the user either does not reply to the welcome message or says something
    # that is not understood, they will be prompted again with this text.
    reprompt_text = "Please ask me for a status by saying, " \
                    "Is the government open today?"
    should_end_session = False

    return build_response(session_attributes, build_speechlet_response(
        card_title, speech_output, reprompt_text, should_end_session))

def get_about_response():
    """ If we wanted to initialize the session to have some attributes we could
    add those here
    """
 
    session_attributes = {}
    card_title = "About OPM Status"
    speech_output = "The creator of this Alexa skill is Patrick Sharkey."
    # If the user either does not reply to the welcome message or says something
    # that is not understood, they will be prompted again with this text.
    reprompt_text = ""

    should_end_session = True

    return build_response(session_attributes, build_speechlet_response(
        card_title, speech_output, reprompt_text, should_end_session))

def get_help_response():
    """ If we wanted to initialize the session to have some attributes we could
    add those here
    """
 
    session_attributes = {}
    card_title = "OPM Status Help"
    speech_output = "To begin, ask o. p. m. status an acceptable question. For example, " \
                    "Is the government is open today?, or " \
                    "Was the government open on 2017-03-14?"
    # If the user either does not reply to the welcome message or says something
    # that is not understood, they will be prompted again with this text.
    reprompt_text = ""

    should_end_session = False

    return build_response(session_attributes, build_speechlet_response(
        card_title, speech_output, reprompt_text, should_end_session))
 
def get_current_opm_status_response(intent, session):
    """ Gets the current status of opm for the day
    """
 
    card_title = "OPM Status Result"
    session_attributes = {}
    speech_output = "I'm not sure which o. p. m. status you requested. " \
                    "Please try again."
    reprompt_text = "I'm not sure which o. p. m. status you requested. " \
                    "Try asking if the government is open today."
    should_end_session = True
 
    # call the operating status endpoint and convert the response to json
    r = requests.get(API_BASE)
    
    if r.status_code == 200:
        data = r.json()
        speech_output = data['ShortStatusMessage'] 
        reprompt_text = ""
    else:
        speech_output = "Please ask me for the o. p. m. status by saying, " \
                        "is the government open today?"
        reprompt_text = "Please ask me for bus times by saying, " \
                        "is the government open today?"
    return build_response(session_attributes, build_speechlet_response(
        card_title, speech_output, reprompt_text, should_end_session))

def get_date_opm_status_response(intent, session):
    """ Gets the current status of opm for the day
    """
    card_title = "OPM Status Result"
    session_attributes = {}
    speech_output = "I'm not sure which o. p. m. status you requested. " \
                    "Please try again."
    reprompt_text = "I'm not sure which o. p. m. status you requested. " \
                    "Try asking if the government is open today."
    should_end_session = True

    if "date" in intent["slots"]:
        dt_value = intent["slots"]["date"]["value"]

        try:
            fmt_dt_value = datetime.datetime.strptime(dt_value, "%Y-%m-%d").strftime("%m/%d/%Y")
 
            # call the operating status endpoint and convert the response to json
            r = requests.get(API_BASE + "?date=" + fmt_dt_value)

            if r.status_code == 200:
                data = r.json()
                status = data['StatusType'].lower()

                if status != 'undefined':
                    speech_output = "Federal agencies in the Washington, DC, area were " \
                                    + status + " on " + dt_value + "."     
                    reprompt_text = ""
            else:
                speech_output = "I seem to be having trouble answering your question. " \
                                "Please ask me for the o. p. m. status by saying, " \
                                "Is the government open today?"
                reprompt_text = "Please ask me for bus times by saying, " \
                                "Is the government open today?"
                should_end_session = False

        except ValueError:
            speech_output = "Sorry, I did not understand that date. Please ask your question " \
                            "again with a valid date."
            reprompt_text = "Sorry, I did not understand that date. Please ask your question  " \
                            "again with a valid date."
            should_end_session = False

    return build_response(session_attributes, build_speechlet_response(
        card_title, speech_output, reprompt_text, should_end_session))
 
# --------------- Helpers that build all of the responses ----------------------
 
def build_speechlet_response(title, output, reprompt_text, should_end_session):
    return {
        'outputSpeech': {
            'type': 'PlainText',
            'text': output
        },
        'card': {
            'type': 'Simple',
            'title':  title,
            'content': output
        },
        'reprompt': {
            'outputSpeech': {
                'type': 'PlainText',
                'text': reprompt_text
            }
        },
        'shouldEndSession': should_end_session
    }
 
 
def build_response(session_attributes, speechlet_response):
    return {
        'version': '1.0',
        'sessionAttributes': session_attributes,
        'response': speechlet_response
    }