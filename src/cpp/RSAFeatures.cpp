

#include "RSAFeatures.hpp"

#include "helpers.hpp"

#include "filters.h"
// CryptoPP::StringSink
// CryptoPP::StringSource
// CryptoPP::StreamTransformationFilter

#include "pem.h"
// CryptoPP::PEM_Load
// CryptoPP::PEM_Save

//
//
//
//
//

void RSAPrivateKey::generateRandomWithKeySizeUsingAutoSeeded(AutoSeededRandomPool& rng, unsigned int keySize)
{
  _rsaPrivate.GenerateRandomWithKeySize(rng._prng, keySize);
}
void RSAPrivateKey::generateRandomWithKeySizeUsingHashDrbg(HashDrbgRandomGenerator& rng, unsigned int keySize)
{
  _rsaPrivate.GenerateRandomWithKeySize(rng._prng, keySize);
}

void RSAPrivateKey::loadFromPemString(const std::string& inPemString)
{
  CryptoPP::StringSource strSrc(inPemString, true);
  CryptoPP::PEM_Load(strSrc, _rsaPrivate);
}

std::string RSAPrivateKey::getAsPemString() const
{
  std::string strPemVal;
  CryptoPP::StringSink strSink(strPemVal);
  CryptoPP::PEM_Save(strSink, _rsaPrivate);
  return strPemVal;
}

std::string RSAPrivateKey::signFromHexStrToHexStrUsingAutoSeeded(AutoSeededRandomPool& rng, const std::string& inHexStr)
{
  return _signFromHexStrToHexStr(rng._prng, inHexStr);
}

std::string RSAPrivateKey::signFromHexStrToHexStrUsingHashDrbg(HashDrbgRandomGenerator& rng, const std::string& inHexStr)
{
  return _signFromHexStrToHexStr(rng._prng, inHexStr);
}

std::string RSAPrivateKey::_signFromHexStrToHexStr(CryptoPP::RandomNumberGenerator& rng, const std::string& inHexStr)
{
  std::string dataDecStr = helpers::hexStr_to_byteBuffer(inHexStr);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  CryptoPP::RSASSA_PKCS1v15_SHA_Signer signer(_rsaPrivate);

  constexpr bool pumpAll = true;
  constexpr bool putMessage = true; // for recovery

  std::string signature;
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), pumpAll,
      new CryptoPP::SignerFilter(rng, signer,
          new CryptoPP::StringSink(signature),
          putMessage
    ) // SignerFilter
  ); // StringSource

  return helpers::byteBuffer_to_hexStr(signature);
}

//
//
//
//
//

void RSAPublicKey::setFromPrivateKey(RSAPrivateKey& inPrivateKey)
{
  _rsaPublic.SetModulus(inPrivateKey._rsaPrivate.GetModulus());
  _rsaPublic.SetPublicExponent(inPrivateKey._rsaPrivate.GetPublicExponent());
}

void RSAPublicKey::loadFromPemString(const std::string& inPemString)
{
  CryptoPP::StringSource strSrc(inPemString, true);
  CryptoPP::PEM_Load(strSrc, _rsaPublic);
}

std::string RSAPublicKey::getAsPemString() const
{
  std::string strPemVal;
  CryptoPP::StringSink strSink(strPemVal);
  CryptoPP::PEM_Save(strSink, _rsaPublic);
  return strPemVal;
}

std::string RSAPublicKey::verifyFromHexStrToHexStr(const std::string& inHexStr)
{
  std::string dataDecStr = helpers::hexStr_to_byteBuffer(inHexStr);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  CryptoPP::RSASSA_PKCS1v15_SHA_Verifier verifier(_rsaPublic);

  constexpr bool pumpAll = true;

  std::string recovered;
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), pumpAll,
      new CryptoPP::SignatureVerificationFilter(
          verifier,
          new CryptoPP::StringSink(recovered),
          CryptoPP::SignatureVerificationFilter::Flags::THROW_EXCEPTION | CryptoPP::SignatureVerificationFilter::Flags::PUT_MESSAGE
    ) // SignatureVerificationFilter
  ); // StringSource

  return helpers::byteBuffer_to_hexStr(recovered);
}






