
#include "AutoSeededRandomPool.hpp"

#include "helpers.hpp"

#include <memory>

AutoSeededRandomPool::AutoSeededRandomPool()
  : _prng(true)
{}

std::string AutoSeededRandomPool::getRandomHexStr(int inBufferSize)
{
  auto pTmpBuffer = std::make_unique<uint8_t[]>(inBufferSize);
  _prng.GenerateBlock(pTmpBuffer.get(), size_t(inBufferSize));

  const char* pData = reinterpret_cast<const char*>(pTmpBuffer.get());
  const std::string_view randomBlock(pData, inBufferSize);
  return helpers::byteBuffer_to_hexStr(randomBlock);
}
