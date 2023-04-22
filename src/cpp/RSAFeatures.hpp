
#pragma once

#include "AutoSeededRandomPool.hpp"

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
  void generateRandomWithKeySize(AutoSeededRandomPool& rng, unsigned int keySize);
  void loadFromPemString(const std::string& inPemString);

public:
  std::string getAsPemString() const;

public:
  std::string signFromHexStrToHexStr(AutoSeededRandomPool& rng, const std::string& inHexStr);

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
