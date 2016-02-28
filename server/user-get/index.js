// var AWS = require('aws-sdk');
// AWS.config.update({region:'us-east-1'});
// var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

// http://kennbrodhagen.net/2016/01/31/how-to-return-html-from-aws-api-gateway-lambda/

var handlebars = require('handlebars');

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));    
  // var stage_name = event.stage_name;

  var source = "<html>FooBar {{someDbValue}} </html>";
  var template = handlebars.compile(source);
  var data = { "someDbValue" : "42" };
  var results = template(data);



  // var msg = ["Lambda function invoked successfully on ", stage_name, " environment."].join("");
  // console.log(msg);
  // context.succeed(msg);
  context.succeed(results);
};
