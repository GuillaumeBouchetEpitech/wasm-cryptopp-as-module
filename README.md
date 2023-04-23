
# WebAssembly Crypto++ as a Browser Module

## Description

Browser cryptography capabilities are limited, this project attempt to fix that.

Definition file is provided for TypeScript (or limited JavaScript autocompletion).

Works in a Node.js context (if you don't lie the crypto module...?).

Unit tested:
* C++ code rely on GoogleTest
* TypeScript code rely on jest

It should be possible to expose most Crypto++ capabilities.

---

### Current Capabilities

#### AES Symmetric Cipher:
  * encrypt
  * decrypt

#### Diffie Hellman Client:
  * generateKeys
  * computeSharedSecret

#### Auto Seeded Random Pool:
  * secure random N random bytes (as hexadecimal string)

### RSA features:
  * generate random private keys
  * PEM import/export of private/public keys
  * sign with private keys
  * verify with public keys

---

# Online Demo Link(s)

**`/!\ important /!\`**

## Demo 1:
http://guillaumebouchetepitech.github.io/wasm-cryptopp-as-module/samples/interactive/index.html

## Demo 2:
http://guillaumebouchetepitech.github.io/wasm-cryptopp-as-module/samples/basic/index.html

**`/!\ important /!\`**

# Dependencies

## Dependency: Emscripten 3.1.26

[Github Link](https://github.com/emscripten-core/emsdk)

This dependency will be downloaded and built with the `Build Everything` method below

## Dependency: cryptopp 8.2.0

[Github Link](https://github.com/weidai11/cryptopp)

This dependency will be downloaded and built with the `Build Everything` method below

# How to Build

## Build Everything

```bash
chmod +x ./sh_everything.sh
./sh_everything.sh
```

## Build Everything (details)

This will:
- handle the c++-to-wasm compiler
  - **[if not found]** will download emsdk (locally)
  - will initialize emscripten compiler (includes setting up the env)
- handle thirdparty libraries
  - **[if not found]** will download libraries (locally)
    - `libcrypto++`
    - `libcrypto++-pem`
  - **[if not build]** compile libraries (wasm byte code library)
    - `libcrypto++`
    - `libcrypto++-pem`
- generate the wasm module
  - **[if not build]** compile the C++ wrapper code
    - and inject what's in `./src/js/post.js`

# Thanks for watching!
