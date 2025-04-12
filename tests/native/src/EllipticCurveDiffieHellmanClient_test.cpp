
#include "gtest/gtest.h"

#include "EllipticCurveDiffieHellmanClient.hpp"
#include "AutoSeededRandomPool.hpp"
#include "helpers.hpp"

#include <memory>
#include <string>
#include <string_view>

TEST(EllipticCurveDiffieHellmanClient_test, success_test) {

  AutoSeededRandomPool prngA;
  AutoSeededRandomPool prngB;

  EllipticCurveDiffieHellmanClient clientA;
  clientA.generateRandomKeys(prngA);

  EllipticCurveDiffieHellmanClient clientB;
  clientB.generateRandomKeys(prngB);

  clientA.computeSharedSecretFromHexStr(clientB.getPublicKeyAsHexStr());
  clientB.computeSharedSecretFromHexStr(clientA.getPublicKeyAsHexStr());

  ASSERT_EQ(clientA.getSharedSecretAsHexStr(), clientB.getSharedSecretAsHexStr());
}

TEST(EllipticCurveDiffieHellmanClient_test, failure_with_garbage_as_public_key) {

  constexpr int k_garbageSize = 128;

  AutoSeededRandomPool prng;
  const std::string garbageStr = prng.getRandomHexStr(k_garbageSize);

  EllipticCurveDiffieHellmanClient client;
  client.generateRandomKeys(prng);

  //
  //

  bool errorHappened = false;

  try
  {
    client.computeSharedSecretFromHexStr(garbageStr);
  }
  catch (...)
  {
    errorHappened = true;
  }

  ASSERT_EQ(errorHappened, true);

}

