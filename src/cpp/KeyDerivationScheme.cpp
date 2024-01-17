
#include "KeyDerivationScheme.hpp"

#include "helpers.hpp"

#include "filters.h"
// CryptoPP::StringSink
// CryptoPP::StringSource
// CryptoPP::StreamTransformationFilter

// #include "pem.h"
// // CryptoPP::PEM_Load
// // CryptoPP::PEM_Save

#include "hkdf.h"
// CryptoPP::HKDF

#include "sha.h"
// CryptoPP::SHA256

#include "hex.h"
// CryptoPP::HexEncoder

#include "base64.h"
// CryptoPP::Base64Decoder

#include <memory>

#include <iostream>

std::string deriveSha256HexStrKeyFromHexStrData(
  const std::string& inKeyHexStr,
  const std::string& inSaltHexStr,
  const std::string& inInfoHexStr,
  std::size_t inKeySize
) {
  // std::string_view salt = "salt";
  // std::string_view info = "HKDF key derivation";

  std::string keyStr = helpers::hexStr_to_byteBuffer(inKeyHexStr);
  std::string saltStr = helpers::hexStr_to_byteBuffer(inSaltHexStr);
  std::string infoStr = helpers::hexStr_to_byteBuffer(inInfoHexStr);


  auto derivedUniquePtr = std::make_unique<unsigned char[]>(inKeySize);
  unsigned char* derivedRawPtr = derivedUniquePtr.get();
  // unsigned char derived[CryptoPP::SHA1::DIGESTSIZE];

  const unsigned char* inKeyPtr = reinterpret_cast<const unsigned char*>(keyStr.data());
  const unsigned char* inSaltPtr = reinterpret_cast<const unsigned char*>(saltStr.data());
  const unsigned char* inInfoPtr = reinterpret_cast<const unsigned char*>(infoStr.data());

  CryptoPP::HKDF<CryptoPP::SHA256> hkdf;
  hkdf.DeriveKey(derivedRawPtr, size_t(inKeySize),
    inKeyPtr, keyStr.size(),
    inSaltPtr, saltStr.size(),
    inInfoPtr, infoStr.size());

  // std::string result;

  // CryptoPP::HexEncoder encoder(new CryptoPP::StringSink(result));
  // encoder.Put(derivedRawPtr, size_t(inSize));
  // encoder.MessageEnd();

	return helpers::byteBuffer_to_hexStr(derivedRawPtr, inKeySize);

  // std::cout << "Derived: " << result << std::endl;

  // return result;

  // CryptoPP::ByteQueue queue;
  // queue.Put(
  //   reinterpret_cast<const unsigned char*>(result.data()),
  //   result.size());
  // _rsaPrivate.Load(queue);


  // CryptoPP::ArraySource as(
  //   reinterpret_cast<const unsigned char*>(result.data()),
  //   result.size(),
  //   true,
  //   new CryptoPP::Base64Decoder());

  // // _rsaPrivate.Load(as);

  // // _rsaPrivate.BERDecode(as);
  // // _rsaPrivate.BERDecodePrivateKey(as, false, k_size);
  // _rsaPrivate.BERDecodePrivateKey(as, false, 1024);

}
