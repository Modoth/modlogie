#!/bin/env bash
set -o errexit

if [ -z "$IMAGE_USER" ]; then exit 1; fi
if [ -z "$IMAGE_VERSION" ]; then exit 1; fi
if [ -n "$BUILD_SERVER" ]; then  export DOCKER_HOST="ssh://$BUILD_SERVER"; fi

scripts_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
build_dir="$scripts_dir/../build/ts_web"
cd "$build_dir"
docker build . -f docker/Dockerfile -t "$IMAGE_USER"/modlogie_client:"$IMAGE_VERSION"
