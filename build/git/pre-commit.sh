#!/usr/bin/env bash

# get files to be linted
FILES=$(git diff --cached --name-only)

# lint them if any
if [[ $FILES ]]; then
  ./node_modules/.bin/eslint $FILES
fi