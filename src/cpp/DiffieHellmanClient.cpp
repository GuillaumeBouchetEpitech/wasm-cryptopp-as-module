
#include "DiffieHellmanClient.hpp"

#include "helpers.hpp"

#include "osrng.h"
// CryptoPP::AutoSeededRandomPool

#include "nbtheory.h"
// CryptoPP::ModularExponentiation

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

void DiffieHellmanClient::generateKeys()
{
  CryptoPP::AutoSeededRandomPool tmp_rnd;

  _dh.AccessGroupParameters().Initialize(_static_p, _static_q, _static_g);

  if(!_dh.GetGroupParameters().ValidateGroup(tmp_rnd, 3))
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

    // throw std::runtime_error("Failed to verify order of the subgroup");
  }

  //////////////////////////////////////////////////////////////

  _priv = CryptoPP::SecByteBlock(_dh.PrivateKeyLength());
  _pub = CryptoPP::SecByteBlock(_dh.PublicKeyLength());
  _dh.GenerateKeyPair(tmp_rnd, _priv, _pub);
}

void DiffieHellmanClient::computeSharedSecretFromHexStrPtr(const void* inDataPtr, uint64_t inDataSize)
{
  const std::string_view tmpHexStr(reinterpret_cast<const char*>(inDataPtr), inDataSize);
  computeSharedSecretFromHexStr(tmpHexStr);
}
void DiffieHellmanClient::computeSharedSecretFromHexStr(const std::string_view inHexOtherPublic)
{
  std::string decStr = helpers::hexAsDecString(inHexOtherPublic);
  const uint8_t* dataPtr = reinterpret_cast<const uint8_t*>(decStr.data());
  computeSharedSecretSecBytesBlockRawPtr(dataPtr, decStr.size());
}
void DiffieHellmanClient::computeSharedSecretSecBytesBlockRawPtr(const void* inDataPtr, uint64_t inDataSize)
{
  computeSharedSecretSecBytesBlock(CryptoPP::SecByteBlock(reinterpret_cast<const uint8_t*>(inDataPtr), std::size_t(inDataSize)));
}
void DiffieHellmanClient::computeSharedSecretSecBytesBlock(const CryptoPP::SecByteBlock& inOtherPublic)
{
  _shared = CryptoPP::SecByteBlock(_dh.AgreedValueLength());

  if(!_dh.Agree(_shared, _priv, inOtherPublic))
  {
    throw std::runtime_error("Failed to reach shared secret");
  }
}

const CryptoPP::SecByteBlock& DiffieHellmanClient::getPublicKey() const
{
  return _pub;
}
std::string DiffieHellmanClient::getPublicKeyAsHexStr() const
{
  return helpers::decAsHexString(_pub.BytePtr(), _pub.SizeInBytes());
}
char* DiffieHellmanClient::getPublicKeyAsHexStrPtr() const
{
  const std::string tmpStr = helpers::decAsHexString(_pub.BytePtr(), _pub.SizeInBytes());

  const std::size_t tmpSize = tmpStr.size();
  char* pMessage = new char[tmpSize + 1];
  std::memcpy(pMessage, tmpStr.data(), tmpSize + 1);
  pMessage[tmpSize] = '\0';
  return pMessage;
}

const CryptoPP::SecByteBlock& DiffieHellmanClient::getSharedSecret() const
{
  return _shared;
}
std::string DiffieHellmanClient::getSharedSecretAsHexStr() const
{
  return helpers::decAsHexString(_shared.BytePtr(), _shared.SizeInBytes());
}
char* DiffieHellmanClient::getSharedSecretAsHexStrPtr() const
{
  const std::string tmpStr = helpers::decAsHexString(_shared.BytePtr(), _shared.SizeInBytes());

  const std::size_t tmpSize = tmpStr.size();
  char* pMessage = new char[tmpSize + 1];
  std::memcpy(pMessage, tmpStr.data(), tmpSize + 1);
  pMessage[tmpSize] = '\0';
  return pMessage;
}

//
//
//
//
//

// RFC 5114, 1024-bit MODP Group with 160-bit Prime Order Subgroup
// http://tools.ietf.org/html/rfc5114#section-2.1
CryptoPP::Integer DiffieHellmanClient::_static_p = CryptoPP::Integer("0xB10B8F96A080E01DDE92DE5EAE5D54EC52C99FBCFB06A3C6"
	"9A6A9DCA52D23B616073E28675A23D189838EF1E2EE652C0"
	"13ECB4AEA906112324975C3CD49B83BFACCBDD7D90C4BD70"
	"98488E9C219A73724EFFD6FAE5644738FAA31A4FF55BCCC0"
	"A151AF5F0DC8B4BD45BF37DF365C1A65E68CFDA76D4DA708"
	"DF1FB2BC2E4A4371");

CryptoPP::Integer DiffieHellmanClient::_static_g = CryptoPP::Integer("0xA4D1CBD5C3FD34126765A442EFB99905F8104DD258AC507F"
	"D6406CFF14266D31266FEA1E5C41564B777E690F5504F213"
	"160217B4B01B886A5E91547F9E2749F4D7FBD7D3B9A92EE1"
	"909D0D2263F80A76A6A24C087A091F531DBF0A0169B6A28A"
	"D662A4D18E73AFA32D779D5918D08BC8858F4DCEF97C2A24"
	"855E6EEB22B3B2E5");

CryptoPP::Integer DiffieHellmanClient::_static_q = CryptoPP::Integer("0xF518AA8781A8DF278ABA4E7D64B7CB9D49462353");

