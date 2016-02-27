var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var uuid = require('uuid');
var Promise = require("bluebird");
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));

function generateResultIdCompositeKey(event) {
  return [event.organization_id, event.election_id, event.contender_id, event.vote_enum].join("--");
};

function incrementCounter(event, context, valueToIncrement) {
  var stage_name = event.stage_name;
  var results_table_name = ["remote-vote-", stage_name, "-results"].join("");
  var generated_result_id = generateResultIdCompositeKey(event);

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

    dynamodb.updateItemAsync({
      "TableName": results_table_name,
      "Key": {
        "result_id": {
          "S": generated_result_id
        }
      },
      "UpdateExpression":  "add num_votes :num",
      "ExpressionAttributeValues": {
        ":num" : { "N": valueToIncrement.toString() }
      }
    }).then(function(data) {
      var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-results completed successfully.'].join("");
      console.log(success_msg);
      context.succeed(success_msg);

    }).catch(function(err) {
      var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-results failed to complete. - ', err].join("");
      console.log(failure_msg);
      context.fail(failure_msg);

    });
  }).catch(function(ConditionalCheckFailedException, err) {

  }).catch(function(err) {
    var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-results failed to complete. - ', err].join("");
    console.log(failure_msg);
    context.fail(failure_msg);

  });
};

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));    

  var stage_name = event.stage_name;
  var table_name = ["remote-vote-", stage_name, "-votes"].join("");

  console.log("Old event vote id: " + JSON.stringify(event.existing_vote));

  // When there's no old vote, just go ahead and aggregate the appropriate counter.

  incrementCounter(event, context, 1);


  // context.succeed("foo goodness:  " + JSON.stringify(event));
};
