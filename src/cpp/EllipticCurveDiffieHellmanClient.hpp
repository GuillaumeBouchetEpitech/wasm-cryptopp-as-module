
#pragma once

#include "AutoSeededRandomPool.hpp"

// #include "dh.h"
// // CryptoPP::DH

#include "eccrypto.h"
// CryptoPP::ECDH

#include "secblock.h"
// CryptoPP::SecByteBlock

class EllipticCurveDiffieHellmanClient
{
private:
	// CryptoPP::DH _dh;
  CryptoPP::ECDH<CryptoPP::ECP>::Domain _dh;
	CryptoPP::SecByteBlock _priv;
	CryptoPP::SecByteBlock _pub;
	CryptoPP::SecByteBlock _shared;

public:
	EllipticCurveDiffieHellmanClient();

public:
	// void generateRandomKeysSimpler();
	// void generateRandomKeys(AutoSeededRandomPool& rng, const std::string& inP, const std::string& inQ, const std::string& inG);
	void generateRandomKeys(AutoSeededRandomPool& rng);

public:
	void computeSharedSecretFromHexStr(const std::string& inHexOtherPublic);

public:
	std::string getPublicKeyAsHexStr() const;
	std::string getSharedSecretAsHexStr() const;

};


