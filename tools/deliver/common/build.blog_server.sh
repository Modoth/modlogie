#usage src_dir=<> target_dir=<>
set -o errexit
dotnet publish -c Release "$src_dir"  -o "$target_dir" 