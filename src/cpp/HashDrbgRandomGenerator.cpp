
#include "HashDrbgRandomGenerator.hpp"

#include "helpers.hpp"

#include <memory>

HashDrbgRandomGenerator::HashDrbgRandomGenerator(
  const std::string& entropy,
  const std::string& nonce,
  const std::string& personalization
) : _prng(
  reinterpret_cast<const CryptoPP::byte*>(entropy.data()), entropy.size(),
  reinterpret_cast<const CryptoPP::byte*>(nonce.data()), nonce.size(),
  reinterpret_cast<const CryptoPP::byte*>(personalization.data()), personalization.size()
)
{}

std::string HashDrbgRandomGenerator::getRandomHexStr(int inBufferSize)
{
  auto pTmpBuffer = std::make_unique<uint8_t[]>(inBufferSize);
  _prng.GenerateBlock(pTmpBuffer.get(), size_t(inBufferSize));

  const char* pData = reinterpret_cast<const char*>(pTmpBuffer.get());
  const std::string_view randomBlock(pData, inBufferSize);
  return helpers::byteBuffer_to_hexStr(randomBlock);
}
