var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var deepEqual = require('deep-equal');
var uuid = require('uuid');
var Promise = require("bluebird");
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));

function generateResultIdCompositeKey(event) {
  return [event.vote_enum].join(""); //, event.election_id, event.contender_id, event.vote_enum].join("--");
};

function incrementCounter(event, context, valueToIncrement) {
  var stage_name = event.stage_name;
  var results_table_name = ["remote-vote-", stage_name, "-results"].join("");
  var generated_result_id = generateResultIdCompositeKey(event);

  console.log("got to putItem code");

  dynamodb.putItemAsync({
    "TableName": results_table_name,
    "ConditionExpression": "attribute_not_exists(organization_id)",
    "Item": {
      "result_id": {
        "S": generated_result_id
      },
      "organization_id": {
        "S": event.organization_id
      },
      "election_id": {
        "S": event.election_id
      },
      "contender_id": {
        "S": event.contender_id
      }
    }
  }).finally(function(data) {

    console.log("got to updateItem code");

    dynamodb.updateItemAsync({
      "TableName": results_table_name,
      "Key": {
        "result_id": {
          "S": generated_result_id
        }
      },
      "UpdateExpression": "add num_votes :num",
      "ExpressionAttributeValues": {
        ":num" : { "N": valueToIncrement.toString() }
      }
    }).then(function(data) {
      var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-results completed successfully.'].join("");
      console.log(success_msg);
      context.succeed(success_msg);

    }).catch(function(err) {
      var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-results failed to completion UPDATE operation. - ', generated_result_id, '--', err].join("");
      console.log(failure_msg);
      context.fail(failure_msg);

    });
  }).catch(function(ConditionalCheckFailedException, err) {
     console.log("got to row exists fail case");

   }).catch(function(err) {
     console.log("got to row exists fail case");

     var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-results failed to complete on PUT operation. - ', err].join("");
     console.log(failure_msg);
     context.fail(failure_msg);

   });
};


function oldVoteExists(event) {
  return Object.keys(event["existing_vote"] || {}).length > 0
};


function votesDiffer(event) {
  var new_vote = {
    "user_id" : event.user_id,
    "organization_id" : event.organization_id,
    "election_id" : event.election_id,
    "contender_id" : event.contender_id,
    "vote_enum" : event.vote_enum
  };

  var results = !deepEqual(event["existing_vote"], new_vote);
  console.log(event["existing_vote"]);
  console.log(new_vote);
  console.log("diff? == " + results);

  return results;
};


function old_vote_with_env(event) {
  var oldie = event["existing_vote"];
  oldie["stage_name"] = event.stage_name;
  console.log(oldie);
  return oldie;
};


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  if( oldVoteExists(event) ) {
    if( votesDiffer(event) ) {
      incrementCounter(old_vote_with_env(event), context, -1);
      incrementCounter(event, context, 1);
    }
  } else {
    incrementCounter(event, context, 1);
  }
};
