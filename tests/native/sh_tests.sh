#!/bin/bash

reset

#
#
# ensure third party build

CURR_DIR=$PWD
cd ../../thirdparties || exit 1
make build_mode="release" build_platform="native" -j8 || exit 1

#
#
# refresh wrapper build

cd "$CURR_DIR" || exit 1
cd ../../ || exit 1
# make build_mode="debug" build_platform="native" clean
make build_mode="debug" build_platform="native" -j8 || exit 1
cd "$CURR_DIR" || exit 1

#
#
# refresh native test build

make build_platform="native" re -j8 || exit 1

#
#
# run (with memory check?)

./bin/exec
# ./bin/exec --gtest_filter=RSAFeatures_test*

# # no memory leaks
# valgrind --leak-check=full --show-leak-kinds=all ./bin/exec --gtest_filter=AutoSeededRandomPool_test*

# # no memory leaks
# valgrind --leak-check=full --show-leak-kinds=all ./bin/exec --gtest_filter=AesSymmetricCipher_test*

# # 5 memory leaks due to singleton inside cryptopp
# valgrind --leak-check=full --show-leak-kinds=all ./bin/exec --gtest_filter=DiffieHellmanClient_test*
