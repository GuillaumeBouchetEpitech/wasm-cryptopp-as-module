
#pragma once

// #include "osrng.h"
// // CryptoPP::AutoSeededRandomPool

#include "drbg.h"
// CryptoPP::Hash_DRBG

#include <string>

// forward declaration
class RSAPrivateKey;

class HashDrbgRandomGenerator
{

  friend RSAPrivateKey;

public:
  HashDrbgRandomGenerator(
    const std::string& entropy,
    const std::string& nonce,
    const std::string& personalization
  );

public:
  std::string getRandomHexStr(int inBufferSize);

private:
  CryptoPP::Hash_DRBG<CryptoPP::SHA256> _prng;

};
