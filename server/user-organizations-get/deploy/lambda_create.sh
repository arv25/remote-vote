echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-organizations-get \
  --description "Remote-Vote App - Retrieve organizations under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organizations-get_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-organizations-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/organizations --principal apigateway.amazonaws.com --statement-id 3f839cef-ff75-4ac4-ab06-0e4a8084fa38 --action lambda:InvokeFunction

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-organizations-get \
  --description "Remote-Vote App - Retrieve organizations under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-organizations-get_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-organizations-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/organizations --principal apigateway.amazonaws.com --statement-id 3f839cef-ff75-4ac4-ab06-0e4a8084fa38 --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
