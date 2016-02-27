echo -e "\nCreating Staging function ..."
aws lambda create-function \
  --function-name remote-vote-stag-server-vote-aggregator \
  --description "Remote-Vote App - Aggregates votes into counters as they come in." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/vote-aggregator_1-0-0_latest.zip

echo -e "\nCreating Staging function api_gateway permissions ..."

echo -e "\nCreating Production function ..."
aws lambda create-function \
  --function-name remote-vote-prod-server-vote-aggregator \
  --description "Remote-Vote App - Aggregates votes into counters as they come in." \
  --handler index.handler \
  --runtime nodejs \
  --memory 128 \
  --timeout 5 \
  --role arn:aws:iam::509101369464:role/lambda_dynamo \
  --zip-file fileb://./dist/vote-aggregator_1-0-0_latest.zip

echo -e "\nCreating Production function api_gateway permissions..."

echo -e "\nFinished creating Lambda functions and permissions."
