### scripts

Each folder except common ones contains the scripts for building, publishing a single image as well as running comtainers. 

#### Files

1. `prepare-build-image.sh`
This script prepare the files for build the image, including the `Dockerfile` file.

2. `build-image.sh`

3. `push-image.sh`

#### Environments:

1. `IMAGE_USER`

2. `IMAGE_VERSION`

3. Optional `BUILD_SERVER`