#!/bin/bash

# Set environment to test
export NODE_ENV=test

# Check if a specific test type is specified
if [ "$1" == "unit" ]; then
  echo "Running unit tests..."
  npx vitest run
elif [ "$1" == "e2e" ]; then
  echo "Running e2e tests..."
  npx playwright test
else
  # Run all tests
  echo "Running all tests..."
  npx vitest run
  echo "Unit tests completed, starting e2e tests..."
  npx playwright test
fi