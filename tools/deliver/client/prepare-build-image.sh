#!/bin/env bash
set -o errexit

scripts_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
src=`realpath "$scripts_dir/../../../client"`
build_dir=`realpath "$scripts_dir/../build/client"`
rm -rf "$build_dir" || true
mkdir -p "$build_dir"
target_dir="$build_dir/app"
( cd "$src" && target_dir="$target_dir" npm run build-to/client-prod )
cp -rf "$scripts_dir/docker" -T "$build_dir/docker"