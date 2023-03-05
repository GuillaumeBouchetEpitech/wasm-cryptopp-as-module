
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

void DiffieHellmanClient::generateKeys(const std::string& inP, const std::string& inQ, const std::string& inG)
{
  CryptoPP::AutoSeededRandomPool tmp_rnd;

  CryptoPP::Integer tmpP(inP.c_str());
  CryptoPP::Integer tmpQ(inQ.c_str());
  CryptoPP::Integer tmpG(inG.c_str());

  _dh.AccessGroupParameters().Initialize(tmpP, tmpQ, tmpG);

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
  }

  //////////////////////////////////////////////////////////////

  _priv = CryptoPP::SecByteBlock(_dh.PrivateKeyLength());
  _pub = CryptoPP::SecByteBlock(_dh.PublicKeyLength());
  _dh.GenerateKeyPair(tmp_rnd, _priv, _pub);
}

void DiffieHellmanClient::computeSharedSecretFromHexStr(const std::string& inHexOtherPublic)
{
  std::string decStr = helpers::hexAsDecString(inHexOtherPublic);

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
  return helpers::decAsHexString(publicKey);
}

std::string DiffieHellmanClient::getSharedSecretAsHexStr() const
{
  const char* pData = reinterpret_cast<const char*>(_shared.BytePtr());
  const std::string_view sharedSecret(pData, _shared.SizeInBytes());
  return helpers::decAsHexString(sharedSecret);
}


