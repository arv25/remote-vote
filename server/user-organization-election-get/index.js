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


function getContenders(event, context) {
  var stage_name = event.stage_name;
  var tableName =["remote-vote-", event.stage_name, "-contenders"].join("");

  return dynamodb.queryAsync({
    "TableName": tableName,
    "IndexName": "election_id-index",
    "ProjectionExpression": "contender_id, contender_name, contender_description",
    "KeyConditionExpression": "election_id = :v1",
    //"FilterExpression": "user_id = :v2 and organization_id = :v3",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.election_id } //,
//      ":v2": { "S": event.user_id },
//      ":v3": { "S": event.organization_id }
    }
  }).then(function(data) {
    var results = dynamoStringFieldsCollector(data);
    console.log("Successfully retrieved contenders from DB: " + JSON.stringify(results));
    return results;

  }).catch(function(err) {
    var err_msg = "Error retrieving contenders from DB: " + err;
    console.log(err_msg);
    console.fail(err_msg);

  });
};


function getElection(event, context) {
  var stage_name = event.stage_name;
  var tableName =["remote-vote-", event.stage_name, "-elections"].join("");

  return dynamodb.queryAsync({
    "TableName": tableName,
    "ProjectionExpression": "election_name, election_description, election_status, election_closing_date",
    "KeyConditionExpression": "election_id = :v1",
    //"FilterExpression": "user_id = :v2 and organization_id = :v3",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.election_id },
      // ":v2": { "S": event.user_id },
      // ":v3": { "S": event.organization_id }
    }
  }).then(function(data) {
    var results = dynamoStringFieldsCollector(data)[0];
    console.log("Successfully retrieved election from DB: " + JSON.stringify(results));
    return results;

  }).catch(function(err) {
    var err_msg = "Error retrieving election from DB: " + err;
    console.log(err_msg);
    console.fail(err_msg);

  });
};


function getSourceHTML(context) {
  return readFile('index.html').then(function(data) {
    console.log("Successfully retrieved template from file.");
    //console.log(data.toString());
    return data.toString();

  }).catch(function(err) {
    var err_msg = "Error retrieving template from file: " + err;
    console.log(err_msg);
    context.fail(err_msg);

  });
};


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  Promise.join(
      getElection(event, context),
      getContenders(event, context),
      getSourceHTML(context),
      function(election, contenders, source) {

        var data = {
          "contenders": contenders,
          "election" : election,
          "user_id": event.user_id,
          "org_id": event.organization_id,
          "election_id": event.election_id
        };
        var template = handlebars.compile(source);
        var results = template(data);

        console.log(["Lambda function invoked successfully on ", event.stage_name, " environment."].join(""));
        context.succeed(results);
      });
};
