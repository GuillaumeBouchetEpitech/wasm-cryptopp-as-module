
#pragma once

#include <string>

std::string deriveSha256HexStrKeyFromHexStrData(
  const std::string& inKeyHexStr,
  const std::string& inSaltHexStr,
  const std::string& inInfoHexStr,
  std::size_t inKeySize);
