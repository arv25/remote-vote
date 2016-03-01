var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var deepEqual = require('deep-equal');
var uuid = require('uuid');
var Promise = require("bluebird");
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));

function generateResultIdCompositeKey(event) {
  return [event.election_id, event.contender_id, event.vote_enum].join("--");
};

function incrementCounter(event, context, valueToIncrement) {
  var stage_name = event.stage_name;
  var results_table_name = ["remote-vote-", stage_name, "-results"].join("");
  var generated_result_id = generateResultIdCompositeKey(event);

  return dynamodb.putItemAsync({
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
      },
      "vote_enum": {
        "S": event.vote_enum
      }
    }
  }).finally(function(data) {

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
      var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-vote-aggregator updated vote counts in Results table successfully.'].join("");
      console.log(success_msg);
      return true;

    }).catch(function(err) {
      var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-vote-aggregator failed to completion UPDATE operation. - ', generated_result_id, '--', err].join("");
      console.log(failure_msg);
      context.fail(failure_msg);

    });
  }).catch(function(ConditionalCheckFailedException, err) {
    console.log("Row exists, PUT operation is a noop.");
    return true;

  }).catch(function(err) {
    var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-vote-aggregator failed to complete on PUT operation. - ', err].join("");
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

  // var results = !deepEqual(event["existing_vote"], new_vote);

  var old_vote = event["existing_vote"];
  var same =
    event.user_id === old_vote.user_id &&
    event.organization_id === old_vote.organization_id &&
    event.election_id === old_vote.election_id &&
    event.contender_id === old_vote.contender_id &&
    event.vote_enum === old_vote.vote_enum;

  console.log(event["existing_vote"]);
  console.log(new_vote);
  console.log("diff? == " + !same);

  return !same;
};


function old_vote_with_env(event) {
  var oldie = event["existing_vote"];
  oldie["stage_name"] = event.stage_name;
  console.log(oldie);
  return oldie;
};


function generateVoteIdCompositeKey(event) {
  return [event.user_id, event.organization_id, event.election_id].join("--");
}


function remove_vote(event, context) {
  var stage_name = event.stage_name;
  var votes_table_name = ["remote-vote-", stage_name, "-votes"].join("");
  var generated_vote_id = generateVoteIdCompositeKey(event);

  return dynamodb.deleteItemAsync({
    "TableName": votes_table_name,
    "Key": {
      "vote_id": {
        "S": generated_vote_id
      }
    },
    "ConditionExpression": "contender_id = :v1 and vote_enum = :v2",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.contender_id },
      ":v2": { "S": event.vote_enum }
    }
  }).then(function(data) {
    var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-vote-aggregator removed old vote successfully.'].join("");
    console.log(success_msg);
    return true;

  }).catch(function(ConditionalCheckFailedException, err) {
    console.log("Row does not exist, DELETE operation is a noop.");
    return true;

  }).catch(function(err) {
    var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-vote-post failed to remove old vote. - ', err].join("");
    console.log(failure_msg);
    context.fail(failure_msg);

  });
};


function persist_vote(event, context) {
  var stage_name = event.stage_name;
  var votes_table_name = ["remote-vote-", stage_name, "-votes"].join("");
  var generated_vote_id = generateVoteIdCompositeKey(event);

  return dynamodb.putItem({
    "TableName": votes_table_name,
    "Item": {
      "user_id": {
        "S": event.user_id
      },
      "organization_id": {
        "S": event.organization_id
      },
      "election_id": {
        "S": event.election_id
      },
      "contender_id": {
        "S": event.contender_id
      },
      "vote_id": {
        "S": generated_vote_id
      },
      "vote_enum": {
        "S": event.vote_enum
      }
    }
  }, function(err, data) {
    if (err) {
      var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-vote-post failed to persist vote. - ', err].join("");
      console.log(failure_msg);
      context.fail(failure_msg);

    } else {
      var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-vote-aggregator persisted vote successfully.'].join("");
      console.log(success_msg);
      return true;
    }
  })
};


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  var success_msg = ['SUCCESS: Remote-Vote-', event.stage_name, '-vote-aggregator completed successfully.'].join("");
  var error_msg = ['Error: Remote-Vote-', event.stage_name, '-vote-aggregator failed to complete.'].join("");
  var noop_msg = "Noting to do, the votes are identical.";

  if( oldVoteExists(event) ) {
    if( votesDiffer(event) ) {

      incrementCounter(old_vote_with_env(event), context, -1);
      incrementCounter(event, context, 1);
      remove_vote(old_vote_with_env(event), context);
      persist_vote(event, context);

    } else {
      console.log(noop_msg);
      context.succeed(noop_msg);
    }
  } else {
    persist_vote(event, context);
    incrementCounter(event, context, 1);

  };
};
