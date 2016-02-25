echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-organization-post \
  --description "Remote-Vote App - Create a new organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organization-post_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-organization-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/user/organization --principal apigateway.amazonaws.com --statement-id 6a2af7e4-0aab-4e6f-8bd2-3f8f3b980232 --action lambda:InvokeFunction

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-organization-post \
  --description "Remote-Vote App - Create a new organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organization-post_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-organization-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/user/organization --principal apigateway.amazonaws.com --statement-id 6a2af7e4-0aab-4e6f-8bd2-3f8f3b980232 --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
