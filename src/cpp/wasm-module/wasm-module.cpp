
#include "../DiffieHellmanClient.hpp"
#include "../AutoSeededRandomPool.hpp"
#include "../AesSymmetricCipher.hpp"
#include "../RSAFeatures.hpp"

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



  emscripten::class_<RSAPrivateKey>("RSAPrivateKeyJs")
    .constructor()
    .function("generateRandomWithKeySize", &RSAPrivateKey::generateRandomWithKeySize)
    .function("loadFromPemString", &RSAPrivateKey::loadFromPemString)
    .function("getAsPemString", &RSAPrivateKey::getAsPemString)
    .function("signFromHexStrToHexStr", &RSAPrivateKey::signFromHexStrToHexStr)
    ;



  emscripten::class_<RSAPublicKey>("RSAPublicKeyJs")
    .constructor()
    .function("setFromPrivateKey", &RSAPublicKey::setFromPrivateKey)
    .function("loadFromPemString", &RSAPublicKey::loadFromPemString)
    .function("getAsPemString", &RSAPublicKey::getAsPemString)
    .function("verifyFromHexStrToHexStr", &RSAPublicKey::verifyFromHexStrToHexStr)
    ;



  emscripten::function("getExceptionMessage", &getExceptionMessage);

}


