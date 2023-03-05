
#pragma once

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

#include <string>

class AutoSeededRandomPool
{
public:
  AutoSeededRandomPool();

public:
  std::string getRandomHexStr(int inBufferSize);

private:
  CryptoPP::AutoSeededRandomPool _prng;

};
