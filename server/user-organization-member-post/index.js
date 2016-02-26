var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var uuid = require('uuid');

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  var stage_name = event.stage_name;
  var table_name = ["remote-vote-", stage_name, "-members"].join("");

  dynamodb.query({
    "TableName": table_name,
    "IndexName": "member_email-index",
    "ProjectionExpression": "member_email",
    "KeyConditionExpression": "member_email = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.member_email }
    }
  }, function(err, data) {
    var email_already_exists = data["Count"] == 1;

    if (email_already_exists) {
      var err_msg = ["Looks like ", event.member_email, " is already present."].join("");
      context.fail(err_msg);

    } else {
      var generated_member_id = uuid.v4();

      dynamodb.putItem({
        "TableName": table_name,
        "Item": {
          "user_id": {
            "S": event.user_id
          },
          "organization_id": {
            "S": event.organization_id
          },
          "member_id": {
            "S": generated_member_id
          },
          "member_email": {
            "S": event.member_email
          }
        }
      }, function(err, data) {
        if (err) {
          var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-member-post failed to complete. - ', err].join("");
          console.log(failure_msg);
          context.fail(failure_msg);

        } else {
          var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-member-post completed successfully.'].join("");
          console.log(success_msg);
          context.succeed(success_msg);
        }
      })
    }
  });
};
