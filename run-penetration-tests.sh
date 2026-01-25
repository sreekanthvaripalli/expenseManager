#!/bin/bash

# Script to run penetration tests and analyze results

echo "Starting penetration testing suite..."

# Create environment file for Newman
cat > test-environment.json << EOF
{
  "id": "test-env",
  "name": "Test Environment",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8080",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "validToken",
      "value": "",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "invalidToken",
      "value": "eyJhbGciOiJIUzI1NiJ9.invalid_token",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "expiredToken",
      "value": "eyJhbGciOiJIUzI1NiJ9.expired_token",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "malformedToken",
      "value": "not.a.jwt.token",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "userId",
      "value": "1",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "categoryId",
      "value": "1",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "expenseId",
      "value": "1",
      "enabled": true,
      "type": "default"
    },
    {
      "key": "budgetId",
      "value": "1",
      "enabled": true,
      "type": "default"
    }
  ],
  "_postman_variable_scope": "environment"
}
EOF

# Run the penetration tests
echo "Running penetration tests with Newman..."
newman run penetration-testing-suite.postman_collection.json \
  -e test-environment.json \
  --reporters cli,json \
  --reporter-json-export penetration-test-results.json \
  --delay-request 100 \
  --timeout-request 10000

# Check if Newman ran successfully
if [ $? -eq 0 ]; then
    echo "Tests completed successfully!"
else
    echo "Tests completed with errors. Check the results."
fi

# Clean up
rm -f test-environment.json

echo "Penetration testing completed. Results saved to penetration-test-results.json"