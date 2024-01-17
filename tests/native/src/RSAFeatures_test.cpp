
#include "gtest/gtest.h"

#include "RSAFeatures.hpp"
#include "AutoSeededRandomPool.hpp"
#include "helpers.hpp"

#include <memory>
#include <string>
#include <string_view>

TEST(RSAFeatures_test, success_test) {

  AutoSeededRandomPool prng;

  RSAPrivateKey privateKey;
  privateKey.generateRandomWithKeySize(prng, 3072);

  RSAPublicKey publicKey;
  publicKey.setFromPrivateKey(privateKey);

  const std::string message = "Some plain text payload";

  const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
  const std::string signedHexStr = privateKey.signFromHexStrToHexStr(prng, hexMessage);

  const std::string verifiedHexStr = publicKey.verifyFromHexStrToHexStr(signedHexStr);
  const std::string verifiedMessage = helpers::hexStr_to_byteBuffer(verifiedHexStr);

  ASSERT_EQ(message, verifiedMessage);
}

TEST(RSAFeatures_test, cipher_decrypt_garbage) {

  AutoSeededRandomPool prng;

  RSAPrivateKey privateKey;
  privateKey.generateRandomWithKeySize(prng, 3072);

  RSAPublicKey publicKey;
  publicKey.setFromPrivateKey(privateKey);

  //
  //

  constexpr int k_garbageSize = 128;
  const std::string garbageStr = prng.getRandomHexStr(k_garbageSize);

  //
  //

  // const std::string verifiedHexStr = publicKey.verifyFromHexStrToHexStr(garbageStr);

  // ASSERT_EQ(verifiedHexStr.size(), 0);

  bool errorHappened = false;

  try
  {
    publicKey.verifyFromHexStrToHexStr(garbageStr);
  }
  catch (...)
  {
    errorHappened = true;
  }

  ASSERT_EQ(errorHappened, true);

}

// TEST(RSAFeatures_test, deriveFromSecretKey) {

//   AutoSeededRandomPool prng;

//   RSAPrivateKey privateKey;
//   privateKey.deriveFromSecretKey("lol");

//   // RSAPublicKey publicKey;
//   // publicKey.setFromPrivateKey(privateKey);

//   // //
//   // //

//   // constexpr int k_garbageSize = 128;
//   // const std::string garbageStr = prng.getRandomHexStr(k_garbageSize);

//   // //
//   // //

//   // // const std::string verifiedHexStr = publicKey.verifyFromHexStrToHexStr(garbageStr);

//   // // ASSERT_EQ(verifiedHexStr.size(), 0);

//   // bool errorHappened = false;

//   // try
//   // {
//   //   publicKey.verifyFromHexStrToHexStr(garbageStr);
//   // }
//   // catch (...)
//   // {
//   //   errorHappened = true;
//   // }

//   // ASSERT_EQ(errorHappened, true);

// }
