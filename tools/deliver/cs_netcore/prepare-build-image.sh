#!/bin/env bash
set -o errexit

scripts_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
src=`realpath "$scripts_dir/../../../servers/cs_netcore/src"`
build_dir=`realpath "$scripts_dir/../build/cs_netcore"`
rm -rf "$build_dir" || true
mkdir -p "$build_dir"
target_dir="$build_dir/app"
dotnet publish -c Release "$src"  -o "$target_dir" 
cp -rf "$scripts_dir/docker" -T "$build_dir/docker"