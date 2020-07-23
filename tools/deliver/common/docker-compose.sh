#!/usr/bin/env bash
set -o errexit
ssh -nNT -L $PWD/docker.sock:/var/run/docker.sock $server &
ssh_pid=$!
sleep 1
trap "kill $ssh_pid || true; rm $PWD/docker.sock" EXIT
DOCKER_HOST=unix://$PWD/docker.sock docker-compose $@