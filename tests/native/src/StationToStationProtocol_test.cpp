
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

    void setupEncryption(const std::string_view inputPassword)
    {
      _data.password = inputPassword;

      // derive a bigger key from password (300bytes)

      const std::string mySalt = "my salt";
      const std::string myINfo = "my info";
      constexpr int k_size = 316;

      _data.derivedKey = deriveSha256HexStrKeyFromHexStrData(_data.password, mySalt, myINfo, k_size);

      // use derived key deterministic random generator

      _data.entropy = _data.derivedKey.substr(0, 100);
      _data.nonce = _data.derivedKey.substr(100, 100);
      _data.personalization = _data.derivedKey.substr(200, 100);
      _data.ivValue = _data.derivedKey.substr(300, 32);

      _prng = std::make_unique<HashDrbgRandomGenerator>(_data.entropy, _data.nonce, _data.personalization);

      // use random generator to generate private/public RSA keys

      _privateKey.generateRandomWithKeySizeUsingHashDrbg(*_prng, 3072);
      _data.privateKeyPem = _privateKey.getAsPemString();

      _publicKey.setFromPrivateKey(_privateKey);
      _data.publicKeyPem = _privateKey.getAsPemString();

      // start a Diffie Hellman client

      _dhClient.generateKeys(tmpP, tmpQ, tmpG);
      _data.dhPublicKey = _dhClient.getPublicKeyAsHexStr();

      _data.dhSignedPublicKey = _privateKey.signFromHexStrToHexStrUsingHashDrbg(*_prng, _data.dhPublicKey);
    }

    const std::string& getSignedPublicKeyAsHexStr() {
      return _data.dhSignedPublicKey;
    }

    void syncWithOtherClient(const std::string& otherClientSignedPublicKey) {
      const std::string otherClientPublicKey = _publicKey.verifyFromHexStrToHexStr(otherClientSignedPublicKey);

      _dhClient.computeSharedSecretFromHexStr(otherClientPublicKey);

      _data.sharedSecret = _dhClient.getSharedSecretAsHexStr();

      const std::string actualKey = _data.sharedSecret.substr(0, 64);

      _cipher.initializeFromHexStr(actualKey, _data.ivValue);
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

  clientA.setupEncryption(passwordA);
  clientB.setupEncryption(passwordA);

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
  clientA.syncWithOtherClient(clientB.getSignedPublicKeyAsHexStr());
  clientB.syncWithOtherClient(clientA.getSignedPublicKeyAsHexStr());

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

  clientA.setupEncryption(passwordA);
  clientB.setupEncryption(passwordA);

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
  clientA.syncWithOtherClient(clientB.getSignedPublicKeyAsHexStr());
  clientB.syncWithOtherClient(clientA.getSignedPublicKeyAsHexStr());

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

  clientA.setupEncryption(passwordB);
  clientB.setupEncryption(passwordB);

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
  clientA.syncWithOtherClient(clientB.getSignedPublicKeyAsHexStr());
  clientB.syncWithOtherClient(clientA.getSignedPublicKeyAsHexStr());

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


