#!/usr/bin/env bash
# usage client_image_name=<> server_image_name=<> image_version=<> user_name=<> app_publishServer=<server> app_CorsOrigins=<> app_name=<> app_port=<> ./publish.sh
set -o errexit

docker_compose=`realpath $PWD/docker-compose.sh`
work_dir="build/app/$app_name"
rm -rf "$work_dir"
mkdir -p "$work_dir"
cp templates-pull/* "$work_dir"
cp $nginx_key_file "$work_dir/cert.key"
cp $nginx_pem_file "$work_dir/cert.pem"
cd "$work_dir"
export app_build_version=`date +%s`
export server=$app_publishServer
if [[ -n "$@" ]]; then
    $docker_compose $@
    exit
fi
ssh $server "docker pull ${client_image_name} && docker pull ${server_image_name}"
$docker_compose up -d --build