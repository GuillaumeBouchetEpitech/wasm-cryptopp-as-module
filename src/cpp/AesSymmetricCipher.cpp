
#include "AesSymmetricCipher.hpp"

#include "helpers.hpp"

#include <iostream>

#include <string>
#include <string_view>
#include <sstream>

#include <cstdlib>
// std::exit

#include "filters.h"
// CryptoPP::StringSink
// CryptoPP::StringSource
// CryptoPP::StreamTransformationFilter

void AesSymmetricCipher::initializeFromHexStr(
  const std::string& inKey,
  const std::string& inIv
) {

  std::string keyDecStr = helpers::hexStr_to_byteBuffer(inKey);
  std::string ivDecStr = helpers::hexStr_to_byteBuffer(inIv);

  if (keyDecStr.size() < CryptoPP::AES::MIN_KEYLENGTH)
  {
    std::stringstream sstr;
    sstr << "AesSymmetricCipher, key too small (min is: " << CryptoPP::AES::MIN_KEYLENGTH << ", input was " << keyDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  if (keyDecStr.size() > CryptoPP::AES::MAX_KEYLENGTH)
  {
    std::stringstream sstr;
    sstr << "AesSymmetricCipher, key too big (max is: " << CryptoPP::AES::MAX_KEYLENGTH << ", input was " << keyDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  if (ivDecStr.size() < _encryption.MinIVLength())
  {
    std::stringstream sstr;
    sstr << "AesSymmetricCipher, iv too small (min is: " << _encryption.MinIVLength() << ", input was " << ivDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  if (ivDecStr.size() > _encryption.MaxIVLength())
  {
    std::stringstream sstr;
    sstr << "AesSymmetricCipher, iv too big (max is: " << _encryption.MaxIVLength() << ", input was " << keyDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  _encryption.SetKeyWithIV(
    reinterpret_cast<const uint8_t*>(keyDecStr.data()),
    keyDecStr.size(),
    reinterpret_cast<const uint8_t*>(ivDecStr.data())
    );

  _decryption.SetKeyWithIV(
    reinterpret_cast<const uint8_t*>(keyDecStr.data()),
    keyDecStr.size(),
    reinterpret_cast<const uint8_t*>(ivDecStr.data())
    );
}

std::string AesSymmetricCipher::encryptFromHexStrAsHexStr(const std::string& inHexStr)
{
  std::string dataDecStr = helpers::hexStr_to_byteBuffer(inHexStr);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  std::string outEncoded;
  // The StreamTransformationFilter removes padding as required.
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), true,
    new CryptoPP::StreamTransformationFilter(_encryption,
      new CryptoPP::StringSink(outEncoded)
    ) // StreamTransformationFilter
  ); // StringSource

  return helpers::byteBuffer_to_hexStr(outEncoded);
}

std::string AesSymmetricCipher::decryptFromHexStrAsHexStr(const std::string& inHexStr)
{
  std::string dataDecStr = helpers::hexStr_to_byteBuffer(inHexStr);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  std::string outRecovered;
  // The StreamTransformationFilter removes padding as required.
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), true,
    new CryptoPP::StreamTransformationFilter(_decryption,
      new CryptoPP::StringSink(outRecovered)
    ) // StreamTransformationFilter
  ); // StringSource

  return helpers::byteBuffer_to_hexStr(outRecovered);
}
