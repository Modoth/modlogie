#!/usr/bin/env bash
# usage app_imageBuildServer=<server> user_name=<> image_name=<> image_version=<> ./publish-push.sh
set -o errexit

work_dir="build/$image_name/docker"
rm -rf "$work_dir"
mkdir -p "$work_dir"

cp templates-push/docker-compose.yml "$work_dir"
cp templates-push/${image_name}/* "$work_dir"
docker_compose=`realpath $PWD/docker-compose.sh`

cd "$work_dir"

latest_image_name="${user_name}/${image_name}:latest"
image_name="${user_name}/${image_name}:${image_version:-latest}"

server=$app_imageBuildServer image_name="$image_name" $docker_compose build
ssh $app_imageBuildServer "docker tag '$image_name' '$latest_image_name' && docker push '$image_name' && docker push '$latest_image_name'"