#!/bin/bash

SOURCE_CODE="$SOURCE_CODE"
EXPECTED_OUTPUT="$EXPECTED_OUTPUT"
LANGUAGE="$LANGUAGE"    

if [ $LANGUAGE = "javascript" ]; then
    echo "$SOURCE_CODE" > /app/source_code.js
    echo "$EXPECTED_OUTPUT" > /app/expected_output.txt
    node /app/source_code.js > /app/output.txt 2>&1

elif [ $LANGUAGE = "java" ]; then
    echo "$SOURCE_CODE" > /app/source_code.java
    echo "$EXPECTED_OUTPUT" > /app/expected_output.txt
    javac /app/source_code.java 2> /app/compile_errors.txt
    
    if [ $? -ne 0 ]; then
        echo "ExpectedOutput: $EXPECTED_OUTPUT"
        ERROR=$(cat /app/compile_errors.txt | tr -d '[:space:]')
        echo "StdOut: $ERROR"
        echo "Result: Wrong Answer"
        exit 1
    fi
    java /app/source_code.java > /app/output.txt 2>&1

else
    echo "Unsupported language: $LANGUAGE"
    exit 1
fi


OUTPUT=$(cat /app/output.txt | tr -d '[:space:]')
EXPECTED_OUTPUT=$(cat /app/expected_output.txt | tr -d '[:space:]')

echo "ExpectedOutput: $EXPECTED_OUTPUT"
echo "Stdout: $OUTPUT"

if [ "$OUTPUT" = "$EXPECTED_OUTPUT" ]; then
    echo "Result: Accepted"
else
    echo "Result: Wrong Answer"
fi
