#!/bin/env bash
set -o errexit

if [ -z "$IMAGE_USER" ]; then exit 1; fi
if [ -z "$IMAGE_VERSION" ]; then exit 1; fi

cmd="docker push $IMAGE_USER/modlogie_client:$IMAGE_VERSION"

if [ -n "$BUILD_SERVER" ]; then
    ssh $BUILD_SERVER $cmd;
else
    $cmd
fi
