echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-register-post \
  --description "Remote-Vote App - Register user via email." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/register-post_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-stag-server-register-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/register --principal apigateway.amazonaws.com --statement-id d825e729-8c09-4843-8a89-7266ad64898c --action lambda:InvokeFunction

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-register-post \
  --description "Remote-Vote App - Register user via email." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/register-post_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."
sleep 5
aws lambda add-permission --function-name arn:aws:lambda:us-east-1:509101369464:function:remote-vote-prod-server-register-post --source-arn arn:aws:execute-api:us-east-1:509101369464:akmyz884m1/*/POST/register --principal apigateway.amazonaws.com --statement-id d825e729-8c09-4843-8a89-7266ad64898c --action lambda:InvokeFunction

echo -e "\nFinished creating Lambda functions and permissions."
