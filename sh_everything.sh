#!/bin/bash

DIR_ROOT=$PWD

#
#
#
#
#

echo ""
echo "#################################################"
echo "#                                               #"
echo "# IF THIS SCRIPT FAIL -> TRY THOSE TWO COMMANDS #"
echo "# -> 'chmod u+x ./sh_everything.sh'             #"
echo "# -> './sh_everything.sh'                       #"
echo "#                                               #"
echo "#################################################"
echo ""

#
#
#
#
#

DIR_THIRDPARTIES=$PWD/thirdparties
DIR_DEPENDENCIES=$DIR_THIRDPARTIES/dependencies

mkdir -p $DIR_DEPENDENCIES

#
#
#
#
#

echo "ensuring the cpp to wasm compiler (emsdk) is installed"

EMSDK_VERSION=3.1.26

sh sh_install_one_git_thirdparty.sh \
  $DIR_DEPENDENCIES \
  "EMSDK" \
  "emsdk" \
  "emscripten-core/emsdk" \
  $EMSDK_VERSION \
  "not-interactive"

cd $DIR_DEPENDENCIES/emsdk

./emsdk install $EMSDK_VERSION
./emsdk activate --embedded $EMSDK_VERSION

. ./emsdk_env.sh

# em++ --clear-cache

cd $DIR_ROOT


#
#
#
#
#

echo "ensuring the thirdparties are installed"

sh sh_install_one_git_thirdparty.sh \
  $DIR_DEPENDENCIES \
  "CRYPTOPP" \
  "cryptopp" \
  "weidai11/cryptopp" \
  "CRYPTOPP_8_2_0" \
  "not-interactive"

sh sh_install_one_git_thirdparty.sh \
  $DIR_DEPENDENCIES \
  "CRYPTOPP_PEM" \
  "cryptopp-pem" \
  "noloader/cryptopp-pem" \
  "CRYPTOPP_8_2_0" \
  "not-interactive"

tree -L 1 $DIR_DEPENDENCIES

#
#
#
#
#

echo "building thirdparties libraries"
cd $DIR_THIRDPARTIES

make build_mode="release" build_platform="web-wasm" all -j4

cd $DIR_ROOT

#
#
#
#
#

echo "building wasm module"

make build_platform="web-wasm" build_mode="release" all -j4

#
#
#
#
#
