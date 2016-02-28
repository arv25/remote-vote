var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var handlebars = require('handlebars');
var Promise = require("bluebird");
var readFile = Promise.promisify(require('fs').readFile);
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));


function dynamoStringFieldsCollector(data) {
  var items = data["Items"];
  var results = [];

  items.map(function(row) {
    var tempRow = {};
    for(var key in row) {
      tempRow[key] = row[key]["S"];
    }
    results.push(tempRow);
  });

  return results;
};


function getElections(event, context) {
  var stage_name = event.stage_name;
  var tableName =["remote-vote-", event.stage_name, "-elections"].join("");

  return dynamodb.queryAsync({
    "TableName": tableName,
    "IndexName": "organization_id-index",
    "ProjectionExpression": "election_id, election_name",
    "KeyConditionExpression": "organization_id = :v1",
    "FilterExpression": "user_id = :v2",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.organization_id },
      ":v2": { "S": event.user_id }
    }
  }).then(function(data) {
    var results = dynamoStringFieldsCollector(data);
    console.log("Successfully retrieved elections from DB: " + JSON.stringify(results));
    return results;

  }).catch(function(err) {
    var err_msg = "Error retrieving elections from DB: " + err;
    console.log(err_msg);
    console.fail(err_msg);

  });
};


function getOrganization(event, context) {
  var stage_name = event.stage_name;
  var tableName =["remote-vote-", event.stage_name, "-organizations"].join("");

  return dynamodb.queryAsync({
    "TableName": tableName,
    "ProjectionExpression": "organization_name, organization_description",
    "KeyConditionExpression": "organization_id = :v1",
    "FilterExpression": "user_id = :v2",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.organization_id },
      ":v2": { "S": event.user_id }
    }
  }).then(function(data) {
    var results = dynamoStringFieldsCollector(data)[0];
    console.log("Successfully retrieved organization from DB: " + JSON.stringify(results));
    return results;

  }).catch(function(err) {
    var err_msg = "Error retrieving organization from DB: " + err;
    console.log(err_msg);
    console.fail(err_msg);

  });
};


function getSourceHTML(context) {
  return readFile('index.html').then(function(data) {
    console.log("Successfully retrieved template from file.");
    console.log(data.toString());
    return data.toString();

  }).catch(function(err) {
    var err_msg = "Error retrieving organization from DB: " + err;
    console.log(err_msg);
    context.fail(err_msg);

  });
};


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));    

  Promise.join(
      getOrganization(event, context),
      getElections(event, context),
      getSourceHTML(context),
      function(org, elections, source) {

        var data = {
          "elections": elections,
          "organization" : org,
          "user_id": event.user_id,
          "org_id": event.organization_id
        };
        var template = handlebars.compile(source);
        var results = template(data);

        console.log(["Lambda function invoked successfully on ", event.stage_name, " environment."].join(""));
        context.succeed(results);
      });
};
