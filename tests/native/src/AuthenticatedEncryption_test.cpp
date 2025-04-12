
#include "gtest/gtest.h"

#include "AutoSeededRandomPool.hpp"
#include "AuthenticatedEncryption.hpp"
#include "helpers.hpp"

#include <memory>
#include <string>
#include <string_view>

TEST(AuthenticatedEncryption_test, same_cipher) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 12;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);

  AuthenticatedEncryption cipher;
  cipher.initializeFromHexStr(keyStr);

  //
  //

  {

    // const std::string message = "Hello World 1!";
    // const std::string message = "Hello World 1!";

    std::stringstream sstr;
    for (int ii = 0; ii < 300; ++ii)
      sstr << "Hello World 1!";
    const std::string message = sstr.str();

    std::cout << "message: " << message << std::endl;

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);

    std::cout << "hexMessage: " << hexMessage << std::endl;

    const std::string encryptedHexStr = cipher.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    std::cout << "encryptedHexStr: " << encryptedHexStr << std::endl;

    //
    //

    const std::string decryptedHexStr = cipher.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);

    std::cout << "decryptedHexStr: " << decryptedHexStr << std::endl;

    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    std::cout << "decryptedMessage: " << decryptedMessage << std::endl;

    //
    //


    ASSERT_EQ(message, decryptedMessage);

  }

  //
  //

  {
    const std::string message = "Hello World 2!";

    // cipher.initializeFromHexStr(keyStr, ivStr);
    // cipher.initializeFromHexStr(keyStr);

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
    const std::string encryptedHexStr = cipher.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    //
    //

    const std::string decryptedHexStr = cipher.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);
    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    //
    //

    ASSERT_EQ(message, decryptedMessage);

  }

}


TEST(AuthenticatedEncryption_test, two_cipher_swap_roles) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 12;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);

  AuthenticatedEncryption cipherA;
  AuthenticatedEncryption cipherB;
  cipherA.initializeFromHexStr(keyStr);
  cipherB.initializeFromHexStr(keyStr);

  //
  //

  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);
    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  // cipherA.initializeFromHexStr(keyStr, ivStr);
  // cipherB.initializeFromHexStr(keyStr, ivStr);

  {
    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);
    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

}



TEST(AuthenticatedEncryption_test, two_cipher_swap_roles_multiple_times) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 12;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);

  AuthenticatedEncryption cipherA;
  AuthenticatedEncryption cipherB;
  cipherA.initializeFromHexStr(keyStr);
  cipherB.initializeFromHexStr(keyStr);

  //
  //

  for (int ii = 0; ii < 5; ++ii)
  {
    // cipherA.initializeFromHexStr(keyStr, ivStr);
    // cipherB.initializeFromHexStr(keyStr, ivStr);

    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);
    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  for (int ii = 0; ii < 5; ++ii)
  {
    // cipherA.initializeFromHexStr(keyStr, ivStr);
    // cipherB.initializeFromHexStr(keyStr, ivStr);

    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);
    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  for (int ii = 0; ii < 5; ++ii)
  {
    // cipherA.initializeFromHexStr(keyStr, ivStr);
    // cipherB.initializeFromHexStr(keyStr, ivStr);

    const std::string_view message = "Hello World!";

    //
    //

    const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
    const std::string encryptedHexStr = cipherA.encryptFromHexStrAsHexStr(hexMessage, ivStr);

    //
    //

    const std::string decryptedHexStr = cipherB.decryptFromHexStrAsHexStr(encryptedHexStr, message.size(), ivStr);
    const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

}





TEST(AuthenticatedEncryption_test, cipher_decrypt_garbage) {

  constexpr int k_keySize = 16;
  constexpr int k_ivSize = 12;
  constexpr int k_garbageSize = 128;

  AutoSeededRandomPool prng;
  const std::string keyStr = prng.getRandomHexStr(k_keySize);
  const std::string ivStr = prng.getRandomHexStr(k_ivSize);
  const std::string garbageStr = prng.getRandomHexStr(k_garbageSize);

  AuthenticatedEncryption cipher;
  cipher.initializeFromHexStr(keyStr);

  //
  //

  bool errorHappened = false;

  try
  {
    cipher.decryptFromHexStrAsHexStr(garbageStr, 10, ivStr);
  }
  catch (...)
  {
    errorHappened = true;
  }

  ASSERT_EQ(errorHappened, true);
}

