var uuid = require('uuid');
var scrypt = require("scrypt");

var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));    

  var stage_name = event.stage_name;
  var table_name = ["remote-vote-", stage_name, "-users"].join("");

  dynamodb.query({
    "TableName": table_name,
    "IndexName": "email-index",
    "ProjectionExpression": "email",
    "KeyConditionExpression": "email = :v1",
    "ExpressionAttributeValues": {
      ":v1": { "S": event.email }
    }
  }, function(err, data) {
    var email_already_exists = data["Count"] == 1;

    if (email_already_exists) {
      var err_msg = ["Looks like ", event.email, " is already registered."].join("");
      context.fail(err_msg);

    } else {
      var generated_user_id = uuid.v4();
      var maxtime = 2.0;
      var scryptParams = scrypt.paramsSync(maxtime);
      var passwordHash = scrypt.kdfSync(event.password, scryptParams);

      dynamodb.putItem({
        "TableName": table_name,
        "Item": {
          "user_id": {
            "S": generated_user_id
          },
          "email": {
            "S": event.email
          },
          "password": {
            "B": passwordHash
          }
        }
      }, function(err, data) {
        if (err) {
          var failure_msg = ['ERROR: Remote-Vote-', stage_name, '-login-post failed to complete. - ', err].join("");
          console.log(failure_msg);
          context.fail(failure_msg);

        } else {
          var success_msg = ['SUCCESS: Remote-Vote-', stage_name, '-login-post completed successfully.'].join("");
          console.log(success_msg);
          context.succeed(success_msg);
        }
      })
    }
  });
};
