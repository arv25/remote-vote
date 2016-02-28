var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var handlebars = require('handlebars');
var Promise = require("bluebird");
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));


function dynamoOrgIdsCollector(data) {
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


function getOrganizations(event, context) {
  var stage_name = event.stage_name;
  var tableName =["remote-vote-", event.stage_name, "-organizations"].join("");

  return dynamodb.queryAsync({
    "TableName": tableName,
    "IndexName": "user_id-index",
    "ProjectionExpression": "organization_name, organization_id",
    "KeyConditionExpression": "user_id = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.user_id }
    }
  }).then(function(data) {
   var results = dynamoOrgIdsCollector(data);
   console.log("Successfully retrieved organizations from DB: " + JSON.stringify(results));
   return results;

  }).catch(function(err) {
    var err_msg = "Error retrieving organizations from DB: " + err;
    console.log(err_msg);
    console.fail(err_msg);

  });
};


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));    

  Promise.join(
      getOrganizations(event, context),
      function(orgs) {

        var source = (function() { /*
          <!DOCTYPE html>
          <html>
            <head>
            </head>
            <body>
              Organizations {{user_id}}
              <ul>
                {{#organizations}}
                  <li><a href="./user/organization?user_id={{../user_id}}&organization_id={{organization_id}}">{{organization_name}}</a></li>
                {{/organizations}}
              </ul>
            </body>
          </html>
          */}).toString().match(/[^]*\/\*([^]*)\*\/\}$/)[1];


        var data = { "user_id": event.user_id, "organizations" : orgs };
        var template = handlebars.compile(source);
        var results = template(data);

        console.log(["Lambda function invoked successfully on ", event.stage_name, " environment."].join(""));
        context.succeed(results);
      });
};
