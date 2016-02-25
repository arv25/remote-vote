echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-org-election-contender-get \
  --description "Remote-Vote App - Retrieve a contender in an election for an organization under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-org-election-contender-get_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-org-election-contender-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/organization/election/contender --principal apigateway.amazonaws.com --statement-id 80441d1a-5d5d-4dff-89cc-7dd300bad3ff --action lambda:InvokeFunction


echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-org-election-contender-get \
  --description "Remote-Vote App - Retrieve contender in an election for an organization under the user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-org-election-contender-get_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-org-election-contender-get --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/GET/user/organization/election/contender --principal apigateway.amazonaws.com --statement-id 80441d1a-5d5d-4dff-89cc-7dd300bad3ff --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
