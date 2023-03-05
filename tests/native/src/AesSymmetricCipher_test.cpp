
#include "gtest/gtest.h"

#include "AutoSeededRandomPool.hpp"
#include "AesSymmetricCipher.hpp"
#include "helpers.hpp"

#include <memory>
#include <string>
#include <string_view>

TEST(AesSymmetricCipher_test, same_cipher) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 16;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);

  AesSymmetricCipher cipher;
  cipher.initializeFromHexStr(keyStr, ivStr);

  //
  //

  {
    const std::string message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::decAsHexString(message);
    const std::string encryptedHexStr = cipher.encryptFromHexStrAsHexStr(hexMessage);

    //
    //

    const std::string decryptedHexStr = cipher.decryptFromHexStrAsHexStr(encryptedHexStr);
    const std::string decryptedMessage = helpers::hexAsDecString(decryptedHexStr);

    //
    //

    ASSERT_EQ(message, decryptedMessage);

  }

}


TEST(AesSymmetricCipher_test, two_cipher_swap_roles) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 16;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);

  AesSymmetricCipher cipherA;
  AesSymmetricCipher cipherB;
  cipherA.initializeFromHexStr(keyStr, ivStr);
  cipherB.initializeFromHexStr(keyStr, ivStr);

  //
  //

  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::decAsHexString(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr);
    const std::string decryptedMessage = helpers::hexAsDecString(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }


  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::decAsHexString(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr);
    const std::string decryptedMessage = helpers::hexAsDecString(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

}



TEST(AesSymmetricCipher_test, two_cipher_swap_roles_multiple_times) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 16;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);

  AesSymmetricCipher cipherA;
  AesSymmetricCipher cipherB;
  cipherA.initializeFromHexStr(keyStr, ivStr);
  cipherB.initializeFromHexStr(keyStr, ivStr);

  //
  //

  for (int ii = 0; ii < 5; ++ii)
  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::decAsHexString(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr);
    const std::string decryptedMessage = helpers::hexAsDecString(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }


  for (int ii = 0; ii < 5; ++ii)
  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::decAsHexString(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr);
    const std::string decryptedMessage = helpers::hexAsDecString(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }


  for (int ii = 0; ii < 5; ++ii)
  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::decAsHexString(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr);
    const std::string decryptedMessage = helpers::hexAsDecString(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

}





TEST(AesSymmetricCipher_test, cipher_decrypt_garbage) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 16;
  constexpr int k_garbageSize = 128;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);
  const std::string garbageStr = prng.getRandomHexStr(k_garbageSize);

  AesSymmetricCipher cipher;
  cipher.initializeFromHexStr(keyStr, ivStr);

  //
  //

  bool errorHappened = false;

  try
  {
    cipher.decryptFromHexStrAsHexStr(garbageStr);
  }
  catch (...)
  {
    errorHappened = true;
  }

  ASSERT_EQ(errorHappened, true);

}

