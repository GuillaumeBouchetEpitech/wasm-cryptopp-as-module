
reset

#
#
# refresh wrapper build

CURR_DIR=$PWD
cd ../
make build_mode="debug" build_platform="native" re -j3
cd $CURR_DIR

#
#
# refresh native test build

make build_platform="native" re -j3

#
#
# run (with memory check?)

./bin/exec

# # no memory leaks
# valgrind --leak-check=full --show-leak-kinds=all ./bin/exec --gtest_filter=AutoSeededRandomPool_test*

# # no memory leaks
# valgrind --leak-check=full --show-leak-kinds=all ./bin/exec --gtest_filter=AesSymmetricCipher_test*

# # 5 memory leaks due to singleton inside cryptopp
# valgrind --leak-check=full --show-leak-kinds=all ./bin/exec --gtest_filter=DiffieHellmanClient_test*
