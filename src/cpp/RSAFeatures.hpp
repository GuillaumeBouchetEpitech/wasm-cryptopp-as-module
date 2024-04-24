
#pragma once

#include "AutoSeededRandomPool.hpp"
#include "HashDrbgRandomGenerator.hpp"


#include "rsa.h"
// CryptoPP::RSA::PrivateKey
// CryptoPP::RSA::PublicKey
// CryptoPP::RSASSA_PKCS1v15_SHA_Signer
// CryptoPP::RSASSA_PKCS1v15_SHA_Verifier

// forward declaration
class RSAPublicKey;

class RSAPrivateKey
{
  friend RSAPublicKey;

public:
  RSAPrivateKey() = default;
  ~RSAPrivateKey() = default;

public:
  void generateRandomWithKeySizeUsingAutoSeeded(AutoSeededRandomPool& rng, unsigned int keySize);
  void generateRandomWithKeySizeUsingHashDrbg(HashDrbgRandomGenerator& rng, unsigned int keySize);
  void loadFromPemString(const std::string& inPemString);

public:
  std::string getAsPemString() const;

public:
  std::string signFromHexStrToHexStrUsingAutoSeeded(AutoSeededRandomPool& rng, const std::string& inHexStr);
  std::string signFromHexStrToHexStrUsingHashDrbg(HashDrbgRandomGenerator& rng, const std::string& inHexStr);

private:
  std::string _signFromHexStrToHexStr(CryptoPP::RandomNumberGenerator& rng, const std::string& inHexStr);

private:
  CryptoPP::RSA::PrivateKey _rsaPrivate;

};

class RSAPublicKey
{

public:
  RSAPublicKey() = default;
  ~RSAPublicKey() = default;

public:
  void setFromPrivateKey(RSAPrivateKey& inPrivateKey);
  void loadFromPemString(const std::string& inPemString);

public:
  std::string getAsPemString() const;

public:
  std::string verifyFromHexStrToHexStr(const std::string& inHexStr);

private:
  CryptoPP::RSA::PublicKey _rsaPublic;

};
