#!/bin/bash

echo "Code-execution started"

SOURCE_CODE="$SOURCE_CODE"
EXPECTED_OUTPUT="$EXPECTED_OUTPUT"

# if [ -n "$SOURCE_CODE" ]; then
#     SOURCE_CODE=$(echo "$SOURCE_CODE" | jq -r .)
# fi

# if [ -n "$EXPECTED_OUTPUT" ]; then
#     EXPECTED_OUTPUT=$(echo "$EXPECTED_OUTPUT" | jq -r .)
# fi

echo "$SOURCE_CODE" > /app/source_code.js
# echo "Expected output: $EXPECTED_OUTPUT" > /app/expected_output.txt

OUTPUT=$(node /app/source_code.js 2>&1)

echo "ExpectedOutput: $EXPECTED_OUTPUT"
echo "Stdout: $OUTPUT"

if [ "$OUTPUT" = "$EXPECTED_OUTPUT" ]; then
    echo "Result: Accepted"
else
    echo "Result: Wrong Answer"
fi

echo "Code-execution completed"
