var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));

  var stage_name = event.stage_name;
  var msg = ["Lambda function invoked successfully on ", stage_name, " environment."].join("");

  console.log(msg);
  context.succeed(msg);
}
