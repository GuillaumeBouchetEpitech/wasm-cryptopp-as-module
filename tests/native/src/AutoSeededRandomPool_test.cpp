
#include "gtest/gtest.h"

#include "AutoSeededRandomPool.hpp"

TEST(AutoSeededRandomPool_test, basic_test_16) {

  constexpr int k_size = 16;

  AutoSeededRandomPool prng;
  const std::string value = prng.getRandomHexStr(k_size);

  ASSERT_EQ(value.size(), size_t(k_size * 2));
}

TEST(AutoSeededRandomPool_test, basic_test_32) {

  constexpr int k_size = 32;

  AutoSeededRandomPool prng;
  const std::string value = prng.getRandomHexStr(k_size);

  ASSERT_EQ(value.size(), size_t(k_size * 2));
}

TEST(AutoSeededRandomPool_test, basic_test_64) {

  constexpr int k_size = 64;

  AutoSeededRandomPool prng;
  const std::string value = prng.getRandomHexStr(k_size);

  ASSERT_EQ(value.size(), size_t(k_size * 2));
}

TEST(AutoSeededRandomPool_test, basic_test_128) {

  constexpr int k_size = 128;

  AutoSeededRandomPool prng;
  const std::string value = prng.getRandomHexStr(k_size);

  ASSERT_EQ(value.size(), size_t(k_size * 2));
}

TEST(AutoSeededRandomPool_test, basic_test_256) {

  constexpr int k_size = 256;

  AutoSeededRandomPool prng;
  const std::string value = prng.getRandomHexStr(k_size);

  ASSERT_EQ(value.size(), size_t(k_size * 2));
}

TEST(AutoSeededRandomPool_test, basic_test_512) {

  constexpr int k_size = 512;

  AutoSeededRandomPool prng;
  const std::string value = prng.getRandomHexStr(k_size);

  ASSERT_EQ(value.size(), size_t(k_size * 2));
}
