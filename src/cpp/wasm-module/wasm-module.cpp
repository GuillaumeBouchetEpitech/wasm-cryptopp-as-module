
#include "../DiffieHellmanClient.hpp"
#include "../EllipticCurveDiffieHellmanClient.hpp"
#include "../HashDrbgRandomGenerator.hpp"
#include "../AutoSeededRandomPool.hpp"
#include "../AesStreamCipher.hpp"
#include "../AuthenticatedEncryption.hpp"
#include "../AesSymmetricCipher.hpp"
#include "../KeyDerivationScheme.hpp"
#include "../RSAFeatures.hpp"

#include "getExceptionMessage.hpp"

#include <emscripten/bind.h>

EMSCRIPTEN_BINDINGS(my_namespace) {

  emscripten::class_<AutoSeededRandomPool>("AutoSeededRandomPoolJs")
    .constructor()
    .function("getRandomHexStr", &AutoSeededRandomPool::getRandomHexStr)
    ;

  emscripten::class_<HashDrbgRandomGenerator>("HashDrbgRandomGeneratorJs")
    .constructor<std::string, std::string, std::string>()
    .function("getRandomHexStr", &HashDrbgRandomGenerator::getRandomHexStr)
    ;

  emscripten::class_<AesStreamCipher>("AesStreamCipherJs")
    .constructor()
    .function("initializeFromHexStr", &AesStreamCipher::initializeFromHexStr)
    .function("encryptFromHexStrAsHexStr", &AesStreamCipher::encryptFromHexStrAsHexStr)
    .function("decryptFromHexStrAsHexStr", &AesStreamCipher::decryptFromHexStrAsHexStr)
    ;

  emscripten::class_<AuthenticatedEncryption>("AuthenticatedEncryptionJs")
    .constructor()
    .function("initializeFromHexStr", &AuthenticatedEncryption::initializeFromHexStr)
    .function("encryptFromHexStrAsHexStr", &AuthenticatedEncryption::encryptFromHexStrAsHexStr)
    .function("decryptFromHexStrAsHexStr", &AuthenticatedEncryption::decryptFromHexStrAsHexStr)
    ;


  emscripten::class_<AesSymmetricCipher>("AesSymmetricCipherJs")
    .constructor()
    .function("initializeFromHexStr", &AesSymmetricCipher::initializeFromHexStr)
    .function("encryptFromHexStrAsHexStr", &AesSymmetricCipher::encryptFromHexStrAsHexStr)
    .function("decryptFromHexStrAsHexStr", &AesSymmetricCipher::decryptFromHexStrAsHexStr)
    ;



  emscripten::class_<DiffieHellmanClient>("DiffieHellmanClientJs")
    .constructor()
    .function("generateRandomKeysSimpler", &DiffieHellmanClient::generateRandomKeysSimpler)
    .function("generateRandomKeys", &DiffieHellmanClient::generateRandomKeys)
    .function("computeSharedSecretFromHexStr", &DiffieHellmanClient::computeSharedSecretFromHexStr)
    .function("getPublicKeyAsHexStr", &DiffieHellmanClient::getPublicKeyAsHexStr)
    .function("getSharedSecretAsHexStr", &DiffieHellmanClient::getSharedSecretAsHexStr)
    ;



  emscripten::class_<EllipticCurveDiffieHellmanClient>("EllipticCurveDiffieHellmanClientJs")
    .constructor()
    .function("generateRandomKeys", &EllipticCurveDiffieHellmanClient::generateRandomKeys)
    .function("computeSharedSecretFromHexStr", &EllipticCurveDiffieHellmanClient::computeSharedSecretFromHexStr)
    .function("getPublicKeyAsHexStr", &EllipticCurveDiffieHellmanClient::getPublicKeyAsHexStr)
    .function("getSharedSecretAsHexStr", &EllipticCurveDiffieHellmanClient::getSharedSecretAsHexStr)
    ;



  emscripten::class_<RSAPrivateKey>("RSAPrivateKeyJs")
    .constructor()
    .function("generateRandomWithKeySizeUsingAutoSeeded", &RSAPrivateKey::generateRandomWithKeySizeUsingAutoSeeded)
    .function("generateRandomWithKeySizeUsingHashDrbg", &RSAPrivateKey::generateRandomWithKeySizeUsingHashDrbg)
    .function("loadFromPemString", &RSAPrivateKey::loadFromPemString)
    .function("getAsPemString", &RSAPrivateKey::getAsPemString)
    .function("signFromHexStrToHexStrUsingAutoSeeded", &RSAPrivateKey::signFromHexStrToHexStrUsingAutoSeeded)
    .function("signFromHexStrToHexStrUsingHashDrbg", &RSAPrivateKey::signFromHexStrToHexStrUsingHashDrbg)
    ;



  emscripten::class_<RSAPublicKey>("RSAPublicKeyJs")
    .constructor()
    .function("setFromPrivateKey", &RSAPublicKey::setFromPrivateKey)
    .function("loadFromPemString", &RSAPublicKey::loadFromPemString)
    .function("getAsPemString", &RSAPublicKey::getAsPemString)
    .function("verifyFromHexStrToHexStr", &RSAPublicKey::verifyFromHexStrToHexStr)
    ;



  emscripten::function("deriveSha256HexStrKeyFromHexStrData", &deriveSha256HexStrKeyFromHexStrData);


  emscripten::function("getExceptionMessage", &getExceptionMessage);

}


