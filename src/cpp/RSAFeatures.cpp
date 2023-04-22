

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

void RSAPrivateKey::generateRandomWithKeySize(AutoSeededRandomPool& rng, unsigned int keySize)
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

std::string RSAPrivateKey::signFromHexStrToHexStr(AutoSeededRandomPool& rng, const std::string& inHexStr)
{
  std::string dataDecStr = helpers::hexAsDecString(inHexStr);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  CryptoPP::RSASSA_PKCS1v15_SHA_Signer signer(_rsaPrivate);

  std::string signature;
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), true,
      new CryptoPP::SignerFilter(rng._prng, signer,
          new CryptoPP::StringSink(signature),
          true // putMessage for recovery
    ) // SignerFilter
  ); // StringSource

  return helpers::decAsHexString(signature);
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
  std::string dataDecStr = helpers::hexAsDecString(inHexStr);
  const uint8_t* dataDecStrPtr = reinterpret_cast<const uint8_t*>(dataDecStr.data());

  CryptoPP::RSASSA_PKCS1v15_SHA_Verifier verifier(_rsaPublic);

  std::string recovered;
  CryptoPP::StringSource source(dataDecStrPtr, dataDecStr.size(), true,
      new CryptoPP::SignatureVerificationFilter(
          verifier,
          new CryptoPP::StringSink(recovered),
          CryptoPP::HashVerificationFilter::Flags::THROW_EXCEPTION | CryptoPP::HashVerificationFilter::Flags::PUT_MESSAGE
    ) // SignatureVerificationFilter
  ); // StringSource

  return helpers::decAsHexString(recovered);
}






