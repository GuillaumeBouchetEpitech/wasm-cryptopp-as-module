
# WebAssembly Crypto++ as a Browser Module

## Online Demo Link

**`/!\ important /!\`**

http://guillaumebouchetepitech.github.io/wasm-cryptopp-as-module/samples/basic/index.html

**`/!\ important /!\`**

# Dependencies

## Dependency: Emscripten 3.1.26
```bash
git clone https://github.com/emscripten-core/emsdk.git

cd emsdk

./emsdk install 3.1.26
./emsdk activate --embedded 3.1.26

. ./emsdk_env.sh

em++ --clear-cache
```

## Dependency: cryptopp 8.2.0

[Github Link](https://github.com/weidai11/cryptopp)

This dependency will be downloaded and built with the `Build Everything` method below

# How to Build

## Build Everything

```bash
chmod +x ./sh_everything.sh
./sh_everything.sh
#- this will:
#  - check if emscripten is available
#  - [if not found] will download libcrypto++
#  - [if not build] compile libcrypto++ (wasm byte code library)
#  - build the wasm module
#    - [if not build] compile the C++ wrapper code
#      - and expose what's specified in `./definitions/wasm-crypto.idl`
#      - and inject what's in `./src/js/post.js`
```

# Thanks for watching!
