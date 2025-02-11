#!/bin/bash

echo "Code-execution started"

SOURCE_CODE="$SOURCE_CODE"
EXPECTED_OUTPUT="$EXPECTED_OUTPUT"


echo "$SOURCE_CODE" > /app/source_code.js
echo "$EXPECTED_OUTPUT" > /app/expected_output.txt

node /app/source_code.js > /app/output.txt 2>&1

OUTPUT=$(cat /app/output.txt | tr -d '[:space:]')
EXPECTED_OUTPUT=$(cat /app/expected_output.txt | tr -d '[:space:]')

echo "ExpectedOutput: $EXPECTED_OUTPUT"
echo "Stdout: $OUTPUT"

if [ "$OUTPUT" = "$EXPECTED_OUTPUT" ]; then
    echo "Result: Accepted"
else
    echo "Result: Wrong Answer"
fi

echo "Code-execution completed"
