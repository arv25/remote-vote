echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-votes-get \
  --description "Remote-Vote App - Retrieve votes under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-votes-get_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-votes-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/votes --principal apigateway.amazonaws.com --statement-id d611161e-7b9b-4a85-a8c2-c12c71d11a6f --action lambda:InvokeFunction


echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-votes-get \
  --description "Remote-Vote App - Retrieve votes under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-votes-get_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-votes-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/votes --principal apigateway.amazonaws.com --statement-id d611161e-7b9b-4a85-a8c2-c12c71d11a6f --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
