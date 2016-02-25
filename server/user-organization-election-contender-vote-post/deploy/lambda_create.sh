echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-user-org-election-contender-vote-post \
  --description "Remote-Vote App - Create a new vote for a contender for a election of an organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-org-election-contender-vote-post_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-user-org-election-contender-vote-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/user/organization/election/contender/vote --principal apigateway.amazonaws.com --statement-id 61933a12-bbe4-4daf-abbe-c828c0b4e021 --action lambda:InvokeFunction


echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-user-org-election-contender-vote-post \
  --description "Remote-Vote App - Create a new vote for a contender for a election of an organization under a user." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/user-org-election-contender-vote-post_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-user-org-election-contender-vote-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/user/organization/election/contender/vote --principal apigateway.amazonaws.com --statement-id 61933a12-bbe4-4daf-abbe-c828c0b4e021 --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
