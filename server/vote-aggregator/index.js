var AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

var uuid = require('uuid');
var Promise = require("bluebird");
Promise.promisifyAll(Object.getPrototypeOf(dynamodb));

exports.handler = function(event, context) {
  console.log("Request received:\n", JSON.stringify(event));
  console.log("Context received:\n", JSON.stringify(context));    

  var stage_name = event.stage_name;
  var table_name = ["remote-vote-", stage_name, "-votes"].join("");

  console.log("Old event vote id: " + JSON.stringify(event.existing_vote));


  context.succeed("foo goodness:  " + JSON.stringify(event));
};
