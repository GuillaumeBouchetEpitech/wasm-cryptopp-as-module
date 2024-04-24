
#include "gtest/gtest.h"

#include "HashDrbgRandomGenerator.hpp"


namespace {

  std::string entropyAB = "1234567890abcdef";
  std::string entropyC = "1234567890abcdefg";
  std::string nonce = "my nonce";
  std::string personalization = "my personalization";

}

TEST(HashDrbgRandomGenerator_test, basic_test_16) {

  constexpr int k_size = 16;

  HashDrbgRandomGenerator prngA(entropyAB, nonce, personalization);
  const std::string valueA = prngA.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngB(entropyAB, nonce, personalization);
  const std::string valueB = prngB.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngC(entropyC, nonce, personalization);
  const std::string valueC = prngC.getRandomHexStr(k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(HashDrbgRandomGenerator_test, basic_test_32) {

  constexpr int k_size = 32;

  HashDrbgRandomGenerator prngA(entropyAB, nonce, personalization);
  const std::string valueA = prngA.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngB(entropyAB, nonce, personalization);
  const std::string valueB = prngB.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngC(entropyC, nonce, personalization);
  const std::string valueC = prngC.getRandomHexStr(k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(HashDrbgRandomGenerator_test, basic_test_64) {

  constexpr int k_size = 64;

  HashDrbgRandomGenerator prngA(entropyAB, nonce, personalization);
  const std::string valueA = prngA.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngB(entropyAB, nonce, personalization);
  const std::string valueB = prngB.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngC(entropyC, nonce, personalization);
  const std::string valueC = prngC.getRandomHexStr(k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(HashDrbgRandomGenerator_test, basic_test_128) {

  constexpr int k_size = 128;

  HashDrbgRandomGenerator prngA(entropyAB, nonce, personalization);
  const std::string valueA = prngA.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngB(entropyAB, nonce, personalization);
  const std::string valueB = prngB.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngC(entropyC, nonce, personalization);
  const std::string valueC = prngC.getRandomHexStr(k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(HashDrbgRandomGenerator_test, basic_test_256) {

  constexpr int k_size = 256;

  HashDrbgRandomGenerator prngA(entropyAB, nonce, personalization);
  const std::string valueA = prngA.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngB(entropyAB, nonce, personalization);
  const std::string valueB = prngB.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngC(entropyC, nonce, personalization);
  const std::string valueC = prngC.getRandomHexStr(k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}

TEST(HashDrbgRandomGenerator_test, basic_test_512) {

  constexpr int k_size = 512;

  HashDrbgRandomGenerator prngA(entropyAB, nonce, personalization);
  const std::string valueA = prngA.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngB(entropyAB, nonce, personalization);
  const std::string valueB = prngB.getRandomHexStr(k_size);

  HashDrbgRandomGenerator prngC(entropyC, nonce, personalization);
  const std::string valueC = prngC.getRandomHexStr(k_size);

  ASSERT_EQ(valueA.size(), size_t(k_size * 2));
  ASSERT_EQ(valueB.size(), size_t(k_size * 2));
  ASSERT_EQ(valueC.size(), size_t(k_size * 2));
  ASSERT_EQ(valueA, valueB);
  ASSERT_NE(valueA, valueC);
}
