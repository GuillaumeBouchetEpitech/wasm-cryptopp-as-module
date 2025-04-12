
#include "AuthenticatedEncryption.hpp"

#include "helpers.hpp"

#include <iostream>

#include <string>
#include <string_view>
#include <sstream>
#include <iostream>

#include <cstdlib>
// std::exit

#include "filters.h"
// CryptoPP::StringSink
// CryptoPP::StringSource
// CryptoPP::StreamTransformationFilter

void AuthenticatedEncryption::initializeFromHexStr(
  const std::string& inKeyHexStr
) {

  std::string keyDecStr = helpers::hexStr_to_byteBuffer(inKeyHexStr);

  if (keyDecStr.size() < CryptoPP::AES::MIN_KEYLENGTH)
  {
    std::stringstream sstr;
    sstr << "AuthenticatedEncryption, key too small (min is: " << CryptoPP::AES::MIN_KEYLENGTH << ", input was " << keyDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  if (keyDecStr.size() > CryptoPP::AES::MAX_KEYLENGTH)
  {
    std::stringstream sstr;
    sstr << "AuthenticatedEncryption, key too big (max is: " << CryptoPP::AES::MAX_KEYLENGTH << ", input was " << keyDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  _key = keyDecStr;
}

std::string AuthenticatedEncryption::encryptFromHexStrAsHexStr(const std::string& inDataHexStr, const std::string& inIvHexStr)
{
  std::string ivDecStr = helpers::hexStr_to_byteBuffer(inIvHexStr);

  if (ivDecStr.size() < _encryption.MinIVLength())
  {
    std::stringstream sstr;
    sstr << "AuthenticatedEncryption, iv too small (min is: " << _encryption.MinIVLength() << ", input was " << ivDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  if (ivDecStr.size() > _encryption.MaxIVLength())
  {
    std::stringstream sstr;
    sstr << "AuthenticatedEncryption, iv too big (max is: " << _encryption.MaxIVLength() << ", input was " << ivDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  //
  //
  //

  std::string dataDecStr = helpers::hexStr_to_byteBuffer(inDataHexStr);

  _encryption.SetKeyWithIV(
    reinterpret_cast<const uint8_t*>(_key.data()),
    _key.size(),
    reinterpret_cast<const uint8_t*>(ivDecStr.data()),
    ivDecStr.size()
    );


  _encryption.SpecifyDataLengths(0, dataDecStr.size(), 0);

  std::string outEncoded;

  //Encryption
  CryptoPP::StringSource ss1(
    // dataDecStr,
    reinterpret_cast<const uint8_t*>(dataDecStr.data()),
    dataDecStr.size(),
    true,
    new CryptoPP::AuthenticatedEncryptionFilter(
      _encryption,
      new CryptoPP::StringSink(outEncoded)
      // mySink
    )
  );

  return helpers::byteBuffer_to_hexStr(outEncoded);
}

std::string AuthenticatedEncryption::decryptFromHexStrAsHexStr(const std::string& inDataHexStr, uint32_t inSize, const std::string& inIvHexStr)
{
  std::string ivDecStr = helpers::hexStr_to_byteBuffer(inIvHexStr);

  if (ivDecStr.size() < _decryption.MinIVLength())
  {
    std::stringstream sstr;
    sstr << "AuthenticatedEncryption, iv too small (min is: " << _decryption.MinIVLength() << ", input was " << ivDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  if (ivDecStr.size() > _decryption.MaxIVLength())
  {
    std::stringstream sstr;
    sstr << "AuthenticatedEncryption, iv too big (max is: " << _decryption.MaxIVLength() << ", input was " << ivDecStr.size() << ")";
    std::string msg = sstr.str();
    std::cerr << msg << std::endl;
    throw std::invalid_argument(msg);
  }

  //
  //
  //

  std::string dataDecStr = helpers::hexStr_to_byteBuffer(inDataHexStr);

  _decryption.SetKeyWithIV(
    reinterpret_cast<const uint8_t*>(_key.data()),
    _key.size(),
    reinterpret_cast<const uint8_t*>(ivDecStr.data()),
    ivDecStr.size()
    );


  _decryption.SpecifyDataLengths(0, inSize, 0);

  std::string outRecovered;

  //Encryption
  CryptoPP::StringSource ss1(
    reinterpret_cast<const uint8_t*>(dataDecStr.data()),
    dataDecStr.size(),
    true,
    new CryptoPP::AuthenticatedDecryptionFilter(
      _decryption,
      new CryptoPP::StringSink(outRecovered)
    )
  );

  return helpers::byteBuffer_to_hexStr(outRecovered);
}
