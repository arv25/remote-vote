var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var uuid = require('uuid');

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  var stage_name = event.stage_name;
  var table_name = ["remote-vote-", stage_name, "-organizations"].join("");

  dynamodb.query({
    "TableName": table_name,
    "IndexName": "organization_name-index",
    "ProjectionExpression": "organization_name",
    "KeyConditionExpression": "organization_name = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.organization_name }
    }
  }, function(err, data) {
    var name_already_exists = data["Count"] == 1;

    if (name_already_exists) {
      var err_msg = ["Looks like ", event.organization_name, " is already created."].join("");
      context.fail(err_msg);

    } else {
      var generated_organization_id = uuid.v4();

      dynamodb.putItem({
        "TableName": table_name,
        "Item": {
          "user_id": {
            "S": event.user_id
          },
          "organization_id": {
            "S": generated_organization_id
          },
          "organization_name": {
            "S": event.organization_name
          },
          "organization_description": {
            "S": event.organization_description
          }
        }
      }, function(err, data) {
        if (err) {
          var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-organization-post failed to complete. - ', err].join("");
          console.log(failure_msg);
          context.fail(failure_msg);

        } else {
          var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-organization-post completed successfully.'].join("");
          console.log(success_msg);
          context.succeed(success_msg);
        }
      })
    }
  });
};
