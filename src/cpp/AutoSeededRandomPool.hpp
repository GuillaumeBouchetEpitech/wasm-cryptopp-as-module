
#pragma once

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

class AutoSeededRandomPool
{
private:
  CryptoPP::AutoSeededRandomPool _prng;

public:
  AutoSeededRandomPool();

public:
  char* getRandomHexStrPtr(uint64_t inBufferSize);

};
