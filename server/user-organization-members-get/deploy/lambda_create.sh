echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-organizations-members-get \
  --description "Remote-Vote App - Retrieve members for an organization under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organizations-members-get_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-organizations-members-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/organization/members --principal apigateway.amazonaws.com --statement-id 45db99b3-72dc-4106-babb-c3a64d5ed277 --action lambda:InvokeFunction

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-organizations-members-get \
  --description "Remote-Vote App - Retrieve members for an organization under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organizations-members-get_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-organizations-members-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/organization/members --principal apigateway.amazonaws.com --statement-id 45db99b3-72dc-4106-babb-c3a64d5ed277 --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
