
#include "../DiffieHellmanClient.hpp"
#include "../AutoSeededRandomPool.hpp"
#include "../AesSymmetricCipher.hpp"

#include "getExceptionMessage.hpp"

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(my_namespace) {

  emscripten::class_<AutoSeededRandomPool>("AutoSeededRandomPoolJs")
    .constructor()
    .function("getRandomHexStr", &AutoSeededRandomPool::getRandomHexStr)
    ;


  emscripten::class_<AesSymmetricCipher>("AesSymmetricCipherJs")
    .constructor()
    .function("initializeFromHexStr", &AesSymmetricCipher::initializeFromHexStr)
    .function("encryptFromHexStrAsHexStr", &AesSymmetricCipher::encryptFromHexStrAsHexStr)
    .function("decryptFromHexStrAsHexStr", &AesSymmetricCipher::decryptFromHexStrAsHexStr)
    ;



  emscripten::class_<DiffieHellmanClient>("DiffieHellmanClientJs")
    .constructor()
    .function("generateKeys", &DiffieHellmanClient::generateKeys)
    .function("computeSharedSecretFromHexStr", &DiffieHellmanClient::computeSharedSecretFromHexStr)
    .function("getPublicKeyAsHexStr", &DiffieHellmanClient::getPublicKeyAsHexStr)
    .function("getSharedSecretAsHexStr", &DiffieHellmanClient::getSharedSecretAsHexStr)
    ;


  emscripten::function("getExceptionMessage", &getExceptionMessage);

}


