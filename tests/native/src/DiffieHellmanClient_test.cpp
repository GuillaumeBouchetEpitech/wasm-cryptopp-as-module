
#include "gtest/gtest.h"

#include "DiffieHellmanClient.hpp"
#include "AutoSeededRandomPool.hpp"
#include "helpers.hpp"

#include <memory>
#include <string>
#include <string_view>

namespace {

  // RFC 5114, 1024-bit MODP Group with 160-bit Prime Order Subgroup
  // http://tools.ietf.org/html/rfc5114#section-2.1
  const std::string tmpP =
    "0xB10B8F96A080E01DDE92DE5EAE5D54EC52C99FBCFB06A3C6"
    "9A6A9DCA52D23B616073E28675A23D189838EF1E2EE652C0"
    "13ECB4AEA906112324975C3CD49B83BFACCBDD7D90C4BD70"
    "98488E9C219A73724EFFD6FAE5644738FAA31A4FF55BCCC0"
    "A151AF5F0DC8B4BD45BF37DF365C1A65E68CFDA76D4DA708"
    "DF1FB2BC2E4A4371";

  const std::string tmpQ =
    "0xF518AA8781A8DF278ABA4E7D64B7CB9D49462353";

  const std::string tmpG =
    "0xA4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507F"
    "D6406CFF14266D31266FEA1E5C41564B777E690F5504F213"
    "160217B4B01B886A5E91547F9E2749F4D7FBD7D3B9A92EE1"
    "909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28A"
    "D662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24"
    "855E6EEB22B3B2E5";

}

TEST(DiffieHellmanClient_test, success_test) {

  DiffieHellmanClient clientA;
  clientA.generateKeys(tmpP, tmpQ, tmpG);

  DiffieHellmanClient clientB;
  clientB.generateKeys(tmpP, tmpQ, tmpG);

  clientA.computeSharedSecretFromHexStr(clientB.getPublicKeyAsHexStr());
  clientB.computeSharedSecretFromHexStr(clientA.getPublicKeyAsHexStr());

  ASSERT_EQ(clientA.getSharedSecretAsHexStr(), clientB.getSharedSecretAsHexStr());
}

TEST(DiffieHellmanClient_test, failure_with_garbage_as_public_key) {

  constexpr int k_garbageSize = 128;

  AutoSeededRandomPool prng;
  const std::string garbageStr = prng.getRandomHexStr(k_garbageSize);

  DiffieHellmanClient client;
  client.generateKeys(tmpP, tmpQ, tmpG);

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

