
#include "gtest/gtest.h"

#include "KeyDerivationScheme.hpp"

namespace {
  const std::string baseValueAB = "0123456789abcdef";
  const std::string baseValueC = "abcdef0123456789";
  const std::string mySalt = "my salt";
  const std::string myINfo = "my info";
}

TEST(KeyDerivationScheme_test, basic_test_16) {

  constexpr int k_size = 16;

  std::string valueA = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueB = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueC = deriveSha256HexStrKeyFromHexStrData(baseValueC, mySalt, myINfo, k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(KeyDerivationScheme_test, basic_test_32) {

  constexpr int k_size = 32;

  std::string valueA = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueB = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueC = deriveSha256HexStrKeyFromHexStrData(baseValueC, mySalt, myINfo, k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(KeyDerivationScheme_test, basic_test_64) {

  constexpr int k_size = 64;

  std::string valueA = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueB = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueC = deriveSha256HexStrKeyFromHexStrData(baseValueC, mySalt, myINfo, k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(KeyDerivationScheme_test, basic_test_128) {

  constexpr int k_size = 128;

  std::string valueA = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueB = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueC = deriveSha256HexStrKeyFromHexStrData(baseValueC, mySalt, myINfo, k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(KeyDerivationScheme_test, basic_test_256) {

  constexpr int k_size = 256;

  std::string valueA = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueB = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueC = deriveSha256HexStrKeyFromHexStrData(baseValueC, mySalt, myINfo, k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(KeyDerivationScheme_test, basic_test_512) {

  constexpr int k_size = 512;

  std::string valueA = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueB = deriveSha256HexStrKeyFromHexStrData(baseValueAB, mySalt, myINfo, k_size);
  std::string valueC = deriveSha256HexStrKeyFromHexStrData(baseValueC, mySalt, myINfo, k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}
