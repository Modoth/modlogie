#usage app_client=<client> ./build.sh
set -o errexit
target_dir="$PWD/build/app"
src=`realpath $PWD/..`
rm -rf "$target_dir" || true
dotnet publish -c Release $src/server/ -o "$target_dir" 
( cd $src/$app_client && target_dir=$target_dir npm run build-to/client-prod)