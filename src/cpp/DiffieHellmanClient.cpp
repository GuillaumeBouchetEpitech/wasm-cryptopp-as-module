
#include "DiffieHellmanClient.hpp"

#include "helpers.hpp"

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

#include "nbtheory.h"
// CryptoPP::ModularExponentiation

#include "integer.h"
// CryptoPP::Integer

#include <iostream>
#include <string>
#include <sstream>

#include <stdexcept>
// std::runtime_error

//
//
//
//
//

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

//
//
//
//
//

void DiffieHellmanClient::generateRandomKeysSimpler()
{
  AutoSeededRandomPool rng;
  generateRandomKeys(rng, tmpP, tmpQ, tmpG);
}

void DiffieHellmanClient::generateRandomKeys(AutoSeededRandomPool& rng, const std::string& inP, const std::string& inQ, const std::string& inG)
{
  CryptoPP::Integer tmpP(inP.c_str());
  CryptoPP::Integer tmpQ(inQ.c_str());
  CryptoPP::Integer tmpG(inG.c_str());

  _dh.AccessGroupParameters().Initialize(tmpP, tmpQ, tmpG);

  if(!_dh.GetGroupParameters().ValidateGroup(rng._prng, 3))
  {
    std::string_view msg = "Failed to validate prime and generator";
    std::cerr << msg << std::endl;
    throw std::runtime_error(msg.data());
  }

  CryptoPP::Integer tmp_p = _dh.GetGroupParameters().GetModulus();
  CryptoPP::Integer tmp_q = _dh.GetGroupParameters().GetSubgroupOrder();
  CryptoPP::Integer tmp_g = _dh.GetGroupParameters().GetGenerator();

  // http://groups.google.com/group/sci.crypt/browse_thread/thread/7dc7eeb04a09f0ce
  CryptoPP::Integer v = CryptoPP::ModularExponentiation(tmp_g, tmp_q, tmp_p);
  if(v != CryptoPP::Integer::One())
  {
    std::string_view msg = "Failed to verify order of the subgroup";
    std::cerr << msg << std::endl;
    throw std::runtime_error(msg.data());
  }

  //////////////////////////////////////////////////////////////

  _priv = CryptoPP::SecByteBlock(_dh.PrivateKeyLength());
  _pub = CryptoPP::SecByteBlock(_dh.PublicKeyLength());
  _dh.GenerateKeyPair(rng._prng, _priv, _pub);
}

void DiffieHellmanClient::computeSharedSecretFromHexStr(const std::string& inHexOtherPublic)
{
  std::string decStr = helpers::hexStr_to_byteBuffer(inHexOtherPublic);

  CryptoPP::SecByteBlock otherPublic(reinterpret_cast<const uint8_t*>(decStr.c_str()), decStr.size());

  _shared = CryptoPP::SecByteBlock(_dh.AgreedValueLength());

  if(!_dh.Agree(_shared, _priv, otherPublic))
  {
    std::string_view msg = "Failed to reach shared secret";
    std::cerr << msg << std::endl;
    throw std::runtime_error(msg.data());
  }

}

std::string DiffieHellmanClient::getPublicKeyAsHexStr() const
{
  const char* pData = reinterpret_cast<const char*>(_pub.BytePtr());
  const std::string_view publicKey(pData, _pub.SizeInBytes());
  return helpers::byteBuffer_to_hexStr(publicKey);
}

std::string DiffieHellmanClient::getSharedSecretAsHexStr() const
{
  const char* pData = reinterpret_cast<const char*>(_shared.BytePtr());
  const std::string_view sharedSecret(pData, _shared.SizeInBytes());
  return helpers::byteBuffer_to_hexStr(sharedSecret);
}


