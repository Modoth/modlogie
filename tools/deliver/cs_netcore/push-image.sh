#!/bin/env bash
set -o errexit

if [ -z "$IMAGE_USER" ]; then exit 1; fi
if [ -z "$IMAGE_VERSION" ]; then exit 1; fi
if [ -n "$BUILD_SERVER" ]; then  export DOCKER_HOST="ssh://$BUILD_SERVER"; fi

docker push "$IMAGE_USER"/modlogie_server_cs_netcore:"$IMAGE_VERSION"