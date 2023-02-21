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
echo "# -> 'chmod u+x ./sh_everything.sh'              #"
echo "# -> './sh_everything.sh'                       #"
echo "#                                               #"
echo "#################################################"
echo ""

#
#
#
#
#

if [ -z "${EMSDK}" ]; then
  echo "the env var 'EMSDK' is missing"
  echo " => check the readme if you want to install emscripten"
  echo " => it emscripten is laready installed, you may just need to run '. ./emsdk_env.sh' in this terminal"
  exit 1;
fi

echo "the env var 'EMSDK' was found"

#
#
#
#
#

echo "ensuring the thirdparties are installed"

chmod u+x ./sh_install_thirdparties.sh
./sh_install_thirdparties.sh not-interactive

#
#
#
#
#

echo "building thirdparties libraries"
cd ./thirdparties

make build_mode="release" build_platform="web-wasm" all -j4

cd $DIR_ROOT

#
#
#
#
#

echo "building wasm module"

make build_mode="release" all -j4

# copy to the samples folder for manual test
cp -rf ./build/* ./samples/basic/cryptopp/

#
#
#
#
#
