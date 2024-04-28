
#pragma once

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

#include <string>

// forward declaration
class RSAPrivateKey;
class DiffieHellmanClient;

class AutoSeededRandomPool
{

  friend RSAPrivateKey;
  friend DiffieHellmanClient;

public:
  AutoSeededRandomPool();

public:
  std::string getRandomHexStr(int inBufferSize);

private:
  CryptoPP::AutoSeededRandomPool _prng;

};
