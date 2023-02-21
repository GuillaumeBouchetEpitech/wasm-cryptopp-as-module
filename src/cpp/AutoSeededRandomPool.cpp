
#include "AutoSeededRandomPool.hpp"

#include "helpers.hpp"


AutoSeededRandomPool::AutoSeededRandomPool()
  : _prng(true)
{}

char* AutoSeededRandomPool::getRandomHexStrPtr(uint64_t inBufferSize)
{
  uint8_t* pTmpBuffer = new uint8_t[inBufferSize];
  _prng.GenerateBlock(pTmpBuffer, inBufferSize);

  const std::string tmpHexStr = helpers::decAsHexString(pTmpBuffer, inBufferSize);
  const std::size_t tmpSize = tmpHexStr.size();

  delete[] pTmpBuffer;

  char* pMessage = new char[tmpSize + 1];
  std::memcpy(pMessage, tmpHexStr.data(), tmpSize + 1);
  pMessage[tmpSize] = '\0';
  return pMessage;
}
