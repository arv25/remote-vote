var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var extend = require('extend');
var Promise = require("bluebird");
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));


function referentialIntegrity(context, tableName, idColumnName, idColumnValue) {
  return dynamodb.queryAsync({
    "TableName": tableName,
    "ProjectionExpression": idColumnName,
    "KeyConditionExpression": idColumnName + " = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": idColumnValue }
    }
  }).then(function(data) {
    var rowIsPresent = data["Count"] == 1;

    if (rowIsPresent == true) {
      var msg = ["Verified referential integrity for ", tableName, " table."].join("");
      console.log(msg);

    } else {
      var msg = [idColumnName, " missing from ", tableName, "."].join("");
      console.log(msg);
    }
    return rowIsPresent;

  }).catch(function(err) {
    var msg = ["Failed to verify referential integrity of ", tableName, " table. - ", err].join("");
    console.log(msg);
    context.fail(msg);
    return false;

  });
};


function electionOpenForVoting(event, context) {
  var stage_name = event.stage_name;
  var electionsTableName = ["remote-vote-", stage_name, "-elections"].join("");

  return dynamodb.queryAsync({
    "TableName": electionsTableName,
    "ProjectionExpression": "election_status",
    "KeyConditionExpression": "election_id = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.election_id }
    }
  }).then(function(data) {
    if (data["Count"] == 0) {
      var err_msg = "Unable to find that election.";
      context.fail(err_msg);
      return false;

    } else {
      var election_is_live = data["Items"][0]["election_status"]["S"] == "Live";

      if (election_is_live == false) {
        var err_msg = "Looks like that election is no longer open for voting.";
        context.fail(err_msg);
        return false;

      } else {
        console.log("Verified election is open for voting.");
        return true;
      }
    }
  }).catch(function(err) {
    var err_msg = "Unable to determine if that election is still open for voting.";
    context.fail(err_msg);
    return false;
  });
};


function dynamoStringDataToHash(data) {
  var items = data["Items"];
  var results = {"existing_vote": {} };

  items.map(function(row) {
    for(var key in row) {
      results["existing_vote"][key] = row[key]["S"];
    }
  });

  return results;
};


function generateVoteIdCompositeKey(event) {
  return [event.user_id, event.organization_id, event.election_id].join("--");
}


function existingVote(event, context){
  var stage_name = event.stage_name;
  var votes_table_name = ["remote-vote-", stage_name, "-votes"].join("");
  var generated_vote_id = generateVoteIdCompositeKey(event);

  return dynamodb.queryAsync({
    "TableName": votes_table_name,
    "KeyConditionExpression": "vote_id = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": generated_vote_id }
    }
  }).then(function(data) {
    return dynamoStringDataToHash(data);

  }).catch(function(err) {
    console.log(err);
    context.fail(err);
  });
};


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  Promise.join(
      referentialIntegrity(context, "remote-vote-"+event.stage_name+"-users", "user_id", event.user_id),
      referentialIntegrity(context, "remote-vote-"+event.stage_name+"-organizations", "organization_id", event.organization_id),
      referentialIntegrity(context, "remote-vote-"+event.stage_name+"-elections", "election_id", event.election_id),
      referentialIntegrity(context, "remote-vote-"+event.stage_name+"-contenders", "contender_id", event.contender_id),
      electionOpenForVoting(event, context),
      existingVote(event, context),
      function(users, orgs, elections, contenders, openElections, existingVote) {
        var passesReferentialIntegrity = users && orgs && elections && contenders && openElections;

        if (passesReferentialIntegrity) {
          console.log("Referential integrity checks passed, delegating to aggregator for persistence.");
          var payload = extend(true, existingVote, event);

          var lambda = new AWS.Lambda();
          lambda.invoke({
            FunctionName: "remote-vote-" + event.stage_name + "-server-vote-aggregator",
            Payload: JSON.stringify(payload)

          }, function(err, data) {
            if(err) {
              console.log("Aggregator encountered an error: " + err);

            } else {
              var response = "Response data from lambda cascade: " + JSON.stringify(data);
              console.log(response);
              context.succeed(response);

            }
          });
        } else {
          context.fail("Did not pass referential integrity check.");
        };
      });
};
