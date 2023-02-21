
#include "AesSymmetricCipher.hpp"

#include "helpers.hpp"

#include <iostream>

#include <string>
#include <string_view>

#include <cstdlib>
// std::exit

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

#include "cryptlib.h"
// CryptoPP::Exception;

#include "filters.h"
// CryptoPP::StringSink
// CryptoPP::StringSource
// CryptoPP::StreamTransformationFilter

void AesSymmetricCipher::initializeFromHexStrPtr(
  const void* inKeyPtr,
  std::size_t inKeySize,
  const void* inIvPtr,
  std::size_t inIvSize
) {
  initializeFromHexStr(
    std::string_view(reinterpret_cast<const char*>(inKeyPtr), inKeySize),
    std::string_view(reinterpret_cast<const char*>(inIvPtr), inIvSize)
    );
}

void AesSymmetricCipher::initializeFromHexStr(
  const std::string_view inKey,
  const std::string_view inIv
) {

  std::string keyDecStr = helpers::hexAsDecString(inKey);
  const uint8_t* keyDecStrPtr = reinterpret_cast<const uint8_t*>(keyDecStr.data());

  std::string ivDecStr = helpers::hexAsDecString(inIv);
  const uint8_t* ivDecStrPtr = reinterpret_cast<const uint8_t*>(ivDecStr.data());

  initializeFromRawPtr(
    keyDecStrPtr, keyDecStr.size(),
    ivDecStrPtr, ivDecStr.size()
  );
}

void AesSymmetricCipher::initializeFromRawPtr(
  const void* inKeyPtr, uint64_t inKeySize,
  const void* inIvPtr, uint64_t inIvSize
) {

  if (inKeySize < CryptoPP::AES::MIN_KEYLENGTH)
  {
    std::string_view msg = "iv too small";
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg.data());
  }

  if (inKeySize > CryptoPP::AES::MAX_KEYLENGTH)
  {
    std::string_view msg = "iv too big";
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg.data());
  }

  if (inIvSize != _cipher.IVSize())
  {
    std::string_view msg = "iv with wrong size";
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg.data());
  }

  _cipher.SetKeyWithIV(
    reinterpret_cast<const uint8_t*>(inKeyPtr),
    inKeySize,
    reinterpret_cast<const uint8_t*>(inIvPtr)
    );
}

void* AesSymmetricCipher::encryptFromHexStrPtrAsHexStrPtr(
  const void* inDataPtr,
  std::size_t inDataSize
) {
  std::string_view tmpInHexStrView(reinterpret_cast<const char*>(inDataPtr), inDataSize);

  std::string dataDecStr = helpers::hexAsDecString(tmpInHexStrView);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  std::string outEncoded;

  // The StreamTransformationFilter removes padding as required.
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), true,
    new CryptoPP::StreamTransformationFilter(_cipher,
      new CryptoPP::StringSink(outEncoded)
    ) // StreamTransformationFilter
  ); // StringSource

  const std::string encodedHexStr = helpers::decAsHexString(outEncoded);

  const std::size_t tmpSize = encodedHexStr.size();
  char* pMessage = new char[tmpSize + 1];
  std::memcpy(pMessage, encodedHexStr.data(), tmpSize + 1);
  pMessage[tmpSize] = '\0';
  return reinterpret_cast<void*>(pMessage);
}

