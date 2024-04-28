
#include "gtest/gtest.h"

#include "KeyDerivationScheme.hpp"
#include "AutoSeededRandomPool.hpp"
#include "RSAFeatures.hpp"
#include "DiffieHellmanClient.hpp"
#include "AesSymmetricCipher.hpp"

#include "helpers.hpp"

#include <memory>
#include <string>
#include <string_view>

namespace {

  //
  //
  //
  //
  //

  struct TestClientData {

    std::string password;

    std::string derivedKey;

    std::string entropy;
    std::string nonce;
    std::string personalization;
    std::string ivValue;

    std::string privateKeyPem;
    std::string publicKeyPem;

    std::string dhPublicKey;
    std::string dhSignedPublicKey;
    std::string sharedSecret;
  };

  //
  //
  //
  //
  //

  struct TestClient {

    TestClientData _data;

    std::unique_ptr<HashDrbgRandomGenerator> _prng;
    RSAPrivateKey _privateKey;
    RSAPublicKey _publicKey;
    DiffieHellmanClient _dhClient;
    AesSymmetricCipher _cipher;

    void setupEncryption_step1(const std::string_view inputPassword)
    {
      _data.password = inputPassword;

      // derive a bigger key from password (300bytes)

      const std::string mySalt = "my salt";
      const std::string myINfo = "my info";
      constexpr int k_size = 128 *3 + 16;

      _data.derivedKey = deriveSha256HexStrKeyFromHexStrData(_data.password, mySalt, myINfo, k_size);

      // use derived key deterministic random generator

      _data.entropy = /*****/ _data.derivedKey.substr(128 * 0, 128);
      _data.nonce = /*******/ _data.derivedKey.substr(128 * 1, 128);
      _data.personalization = _data.derivedKey.substr(128 * 2, 128);
      _data.ivValue = /*****/ _data.derivedKey.substr(128 * 3, 32);

      _prng = std::make_unique<HashDrbgRandomGenerator>(_data.entropy, _data.nonce, _data.personalization);

      // use random generator to generate private/public RSA keys

      _privateKey.generateRandomWithKeySizeUsingHashDrbg(*_prng, 3072);
      _data.privateKeyPem = _privateKey.getAsPemString();

      _publicKey.setFromPrivateKey(_privateKey);
      _data.publicKeyPem = _privateKey.getAsPemString();

      // start a Diffie Hellman client

      _dhClient.generateRandomKeysSimpler();
      _data.dhPublicKey = _dhClient.getPublicKeyAsHexStr();

      _data.dhSignedPublicKey = _privateKey.signFromHexStrToHexStrUsingHashDrbg(*_prng, _data.dhPublicKey);
    }

    void syncWithOtherClient_step2(const std::string& otherClientSignedPublicKey) {
      const std::string otherClientPublicKey = _publicKey.verifyFromHexStrToHexStr(otherClientSignedPublicKey);

      _dhClient.computeSharedSecretFromHexStr(otherClientPublicKey);

      _data.sharedSecret = _dhClient.getSharedSecretAsHexStr();

      const std::string actualKey = _data.sharedSecret.substr(0, 64);

      _cipher.initializeFromHexStr(actualKey, _data.ivValue);
    }

    const std::string& getSignedPublicKeyAsHexStr() {
      return _data.dhSignedPublicKey;
    }

    std::string encryptStrToHexStr(const std::string& message)
    {
      const std::string hexMessage = helpers::byteBuffer_to_hexStr(message);
      const std::string encryptedHexStr = _cipher.encryptFromHexStrAsHexStr(hexMessage);
      return encryptedHexStr;
    }

    std::string decryptHexStrToStr(const std::string& encryptedHexStr)
    {
      const std::string decryptedHexStr = _cipher.decryptFromHexStrAsHexStr(encryptedHexStr);
      const std::string decryptedMessage = helpers::hexStr_to_byteBuffer(decryptedHexStr);
      return decryptedMessage;
    }

  };

  //
  //
  //
  //
  //

}

//
//
//
//
//

TEST(StationToStationProtocol_test, basic_setup) {

  TestClient clientA;
  TestClient clientB;

  const std::string passwordA = "pineapple";
  const std::string passwordB = "pen";

  //
  //
  // use passwordA to setup both client
  // -> this should work
  //
  //

  clientA.setupEncryption_step1(passwordA);
  clientB.setupEncryption_step1(passwordA);

  // equals (-> the determistic data that is never shared)
  ASSERT_EQ(clientA._data.password, passwordA);
  ASSERT_EQ(clientB._data.password, passwordA);
  ASSERT_EQ(clientA._data.derivedKey, clientB._data.derivedKey);
  // not equals
  ASSERT_NE(clientA._data.dhPublicKey, clientB._data.dhPublicKey);
  ASSERT_NE(clientA._data.dhSignedPublicKey, clientB._data.dhSignedPublicKey);

  // simplified here
  // but in reality:
  // => clientA send the [SignedPublicKeyAsHexStr] to clientB
  // => clientB send the [SignedPublicKeyAsHexStr] to clientA
  clientA.syncWithOtherClient_step2(clientB.getSignedPublicKeyAsHexStr());
  clientB.syncWithOtherClient_step2(clientA.getSignedPublicKeyAsHexStr());

  // equals
  ASSERT_EQ(clientA._data.sharedSecret, clientB._data.sharedSecret);

  //

  {
    const std::string message = "clientA want to say Hi to clientB";

    const std::string encryptedHexStr = clientA.encryptStrToHexStr(message);
    const std::string decryptedMessage = clientB.decryptHexStrToStr(encryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  //

  {
    const std::string message = "clientB want to reply Hi to clientA";

    const std::string encryptedHexStr = clientB.encryptStrToHexStr(message);
    const std::string decryptedMessage = clientA.decryptHexStrToStr(encryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  //
  //
  // use passwordA AGAIN to setup both client
  // -> this should work and have some data similar to the first try
  //
  //

  TestClientData backupTest1ClientA = clientA._data;
  TestClientData backupTest1ClientB = clientB._data;

  clientA.setupEncryption_step1(passwordA);
  clientB.setupEncryption_step1(passwordA);

  // equals (-> the determistic data that is never shared)
  ASSERT_EQ(clientA._data.password, passwordA);
  ASSERT_EQ(clientB._data.password, passwordA);
  ASSERT_EQ(clientA._data.derivedKey, clientB._data.derivedKey);
  // not equals
  ASSERT_NE(clientA._data.dhPublicKey, clientB._data.dhPublicKey);
  ASSERT_NE(clientA._data.dhSignedPublicKey, clientB._data.dhSignedPublicKey);

  // simplified here
  // but in reality:
  // => clientA send the [SignedPublicKeyAsHexStr] to clientB
  // => clientB send the [SignedPublicKeyAsHexStr] to clientA
  clientA.syncWithOtherClient_step2(clientB.getSignedPublicKeyAsHexStr());
  clientB.syncWithOtherClient_step2(clientA.getSignedPublicKeyAsHexStr());

  // equals
  ASSERT_EQ(clientA._data.sharedSecret, clientB._data.sharedSecret);

  //

  {
    const std::string message = "clientA want to say Hi to clientB";

    const std::string encryptedHexStr = clientA.encryptStrToHexStr(message);
    const std::string decryptedMessage = clientB.decryptHexStrToStr(encryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  //

  {
    const std::string message = "clientB want to reply Hi to clientA";

    const std::string encryptedHexStr = clientB.encryptStrToHexStr(message);
    const std::string decryptedMessage = clientA.decryptHexStrToStr(encryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  // equals (-> the determistic data that is never shared)
  ASSERT_EQ(clientA._data.password, backupTest1ClientA.password);
  ASSERT_EQ(clientB._data.password, backupTest1ClientB.password);
  ASSERT_EQ(clientA._data.derivedKey, backupTest1ClientA.derivedKey);
  ASSERT_EQ(clientB._data.derivedKey, backupTest1ClientB.derivedKey);
  // not equals (-> the new password)
  ASSERT_NE(clientA._data.dhPublicKey, backupTest1ClientA.dhPublicKey);
  ASSERT_NE(clientB._data.dhPublicKey, backupTest1ClientB.dhPublicKey);
  ASSERT_NE(clientA._data.dhSignedPublicKey, backupTest1ClientA.dhSignedPublicKey);
  ASSERT_NE(clientB._data.dhSignedPublicKey, backupTest1ClientB.dhSignedPublicKey);
  ASSERT_NE(clientA._data.sharedSecret, backupTest1ClientA.sharedSecret);
  ASSERT_NE(clientB._data.sharedSecret, backupTest1ClientB.sharedSecret);

  //
  //
  //
  //
  //

  //
  //
  // use passwordB to setup both client
  // -> this should work but not have any data similar to the previous two tries
  //
  //

  TestClientData backupTest2ClientA = clientA._data;
  TestClientData backupTest2ClientB = clientB._data;

  clientA.setupEncryption_step1(passwordB);
  clientB.setupEncryption_step1(passwordB);

  // equals
  ASSERT_EQ(clientA._data.password, passwordB);
  ASSERT_EQ(clientB._data.password, passwordB);
  ASSERT_EQ(clientA._data.derivedKey, clientB._data.derivedKey);
  // not equals
  ASSERT_NE(clientA._data.dhPublicKey, clientB._data.dhPublicKey);
  ASSERT_NE(clientA._data.dhSignedPublicKey, clientB._data.dhSignedPublicKey);

  // simplified here
  // but in reality:
  // => clientA send the [SignedPublicKeyAsHexStr] to clientB
  // => clientB send the [SignedPublicKeyAsHexStr] to clientA
  clientA.syncWithOtherClient_step2(clientB.getSignedPublicKeyAsHexStr());
  clientB.syncWithOtherClient_step2(clientA.getSignedPublicKeyAsHexStr());

  // equals
  ASSERT_EQ(clientA._data.sharedSecret, clientB._data.sharedSecret);

  //

  {
    const std::string message = "clientA want to say Hi to clientB";

    const std::string encryptedHexStr = clientA.encryptStrToHexStr(message);
    const std::string decryptedMessage = clientB.decryptHexStrToStr(encryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  //

  {
    const std::string message = "clientB want to reply Hi to clientA";

    const std::string encryptedHexStr = clientB.encryptStrToHexStr(message);
    const std::string decryptedMessage = clientA.decryptHexStrToStr(encryptedHexStr);

    ASSERT_EQ(message, decryptedMessage);
  }

  // not equals (test1 data with current data using new password)
  ASSERT_NE(clientA._data.password, backupTest1ClientA.password);
  ASSERT_NE(clientB._data.password, backupTest1ClientB.password);
  ASSERT_NE(clientA._data.derivedKey, backupTest1ClientA.derivedKey);
  ASSERT_NE(clientB._data.derivedKey, backupTest1ClientB.derivedKey);
  ASSERT_NE(clientA._data.dhPublicKey, backupTest1ClientA.dhPublicKey);
  ASSERT_NE(clientB._data.dhPublicKey, backupTest1ClientB.dhPublicKey);
  ASSERT_NE(clientA._data.dhSignedPublicKey, backupTest1ClientA.dhSignedPublicKey);
  ASSERT_NE(clientB._data.dhSignedPublicKey, backupTest1ClientB.dhSignedPublicKey);
  ASSERT_NE(clientA._data.sharedSecret, backupTest1ClientA.sharedSecret);
  ASSERT_NE(clientB._data.sharedSecret, backupTest1ClientB.sharedSecret);

  // not equals (test2 data with current data using new password)
  ASSERT_NE(clientA._data.password, backupTest2ClientA.password);
  ASSERT_NE(clientB._data.password, backupTest2ClientB.password);
  ASSERT_NE(clientA._data.derivedKey, backupTest2ClientA.derivedKey);
  ASSERT_NE(clientB._data.derivedKey, backupTest2ClientB.derivedKey);
  ASSERT_NE(clientA._data.dhPublicKey, backupTest2ClientA.dhPublicKey);
  ASSERT_NE(clientB._data.dhPublicKey, backupTest2ClientB.dhPublicKey);
  ASSERT_NE(clientA._data.dhSignedPublicKey, backupTest2ClientA.dhSignedPublicKey);
  ASSERT_NE(clientB._data.dhSignedPublicKey, backupTest2ClientB.dhSignedPublicKey);
  ASSERT_NE(clientA._data.sharedSecret, backupTest2ClientA.sharedSecret);
  ASSERT_NE(clientB._data.sharedSecret, backupTest2ClientB.sharedSecret);

  //
  //
  //
  //
  //

}


