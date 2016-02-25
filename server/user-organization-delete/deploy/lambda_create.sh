echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-organization-delete \
  --description "Remote-Vote App - Delete an organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organization-delete_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-organization-delete --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/DELETE/user/organization --principal apigateway.amazonaws.com --statement-id 9584b03f-3757-472d-815a-162acc66b6ec --action lambda:InvokeFunction

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-organization-delete \
  --description "Remote-Vote App - Delete an organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organization-delete_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-organization-delete --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/DELETE/user/organization --principal apigateway.amazonaws.com --statement-id 9584b03f-3757-472d-815a-162acc66b6ec --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
