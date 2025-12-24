#!/bin/bash
set -e

ENV_FILE=".env"
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

NAMESPACE="motus"


if ! kubectl get namespace $NAMESPACE >/dev/null 2>&1; then
  sudo kubectl create namespace $NAMESPACE
fi

sudo kubectl create secret generic motus-secrets \
  --from-env-file=.env \
  --namespace $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

export TAG="latest"
export BUILD_TS=$(date +%s)
export REGISTRY_URL="registry.rhiva.fun"

sudo docker build --build-arg GITHUB_TOKEN=$GITHUB_TOKEN -t $REGISTRY_URL/motus/server:$TAG .
sudo docker push $REGISTRY_URL/motus/server:$TAG

sudo kubectl create secret generic regcred \
--from-file=.dockerconfigjson=$HOME/.docker/config.json \
--namespace $NAMESPACE \
--type=kubernetes.io/dockerconfigjson \
--dry-run=client -o yaml | kubectl apply -f - 

sudo kubectl apply -f k8s.yml