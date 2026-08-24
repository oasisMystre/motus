#!/bin/bash

export $(grep -v '^#' .env.prod | xargs) && \
for var in $(grep -v '^#' .env.prod | cut -d= -f1); do
  if [[ "$var" == EXPO_PUBLIC* ]]; then
    visibility="sensitive"
  else
    visibility="secret"
  fi
  eas env:create --name "$var" --value "${!var}" --type string --visibility $visibility --override --environment preview production
done
