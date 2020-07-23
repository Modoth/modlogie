#usage image_src=<> image_name=<>
set -o errexit
export target_dir="$PWD/build/${image_name}/app"
export src_dir=`realpath $PWD/../${image_src}`
rm -rf "$target_dir" || true
./build.${image_name}.sh