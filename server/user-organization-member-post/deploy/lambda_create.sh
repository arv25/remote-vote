echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-organization-member-post \
  --description "Remote-Vote App - Create a new member of an organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organization-member-post_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-organization-member-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/user/organization/member --principal apigateway.amazonaws.com --statement-id 603eb013-2def-48b7-bb89-6b866a5fd7d2 --action lambda:InvokeFunction

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-organization-member-post \
  --description "Remote-Vote App - Create a new member of an organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organization-member-post_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-organization-member-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/user/organization/member --principal apigateway.amazonaws.com --statement-id 603eb013-2def-48b7-bb89-6b866a5fd7d2 --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
