
#pragma once

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

#include <string>

// forward declaration
class RSAPrivateKey;

class AutoSeededRandomPool
{

  friend RSAPrivateKey;

public:
  AutoSeededRandomPool();

public:
  std::string getRandomHexStr(int inBufferSize);

private:
  CryptoPP::AutoSeededRandomPool _prng;

};
