
#pragma once

#include "AutoSeededRandomPool.hpp"

#include "dh.h"
// CryptoPP::DH

#include "secblock.h"
// CryptoPP::SecByteBlock

class DiffieHellmanClient
{
private:
	CryptoPP::DH _dh;
	CryptoPP::SecByteBlock _priv;
	CryptoPP::SecByteBlock _pub;
	CryptoPP::SecByteBlock _shared;

public:
	DiffieHellmanClient() = default;

public:
	void generateRandomKeysSimpler();
	void generateRandomKeys(AutoSeededRandomPool& rng, const std::string& inP, const std::string& inQ, const std::string& inG);

public:
	void computeSharedSecretFromHexStr(const std::string& inHexOtherPublic);

public:
	std::string getPublicKeyAsHexStr() const;
	std::string getSharedSecretAsHexStr() const;

};


