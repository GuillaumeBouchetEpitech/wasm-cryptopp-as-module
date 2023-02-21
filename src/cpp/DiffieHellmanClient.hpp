
#pragma once

#include "integer.h"
// CryptoPP::Integer

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

private:
	// RFC 5114, 1024-bit MODP Group with 160-bit Prime Order Subgroup
	// http://tools.ietf.org/html/rfc5114#section-2.1
	static CryptoPP::Integer _static_p;
	static CryptoPP::Integer _static_g;
	static CryptoPP::Integer _static_q;

public:
	DiffieHellmanClient() = default;

public:
	void generateKeys();

public:
	void computeSharedSecretFromHexStrPtr(const void* inDataPtr, uint64_t inDataSize);
	void computeSharedSecretFromHexStr(const std::string_view inHexOtherPublic);
	void computeSharedSecretSecBytesBlockRawPtr(const void* inDataPtr, uint64_t inDataSize);
	void computeSharedSecretSecBytesBlock(const CryptoPP::SecByteBlock& inOtherPublic);

public:
	const CryptoPP::SecByteBlock& getPublicKey() const;
	std::string getPublicKeyAsHexStr() const;
	char* getPublicKeyAsHexStrPtr() const;

public:
	const CryptoPP::SecByteBlock& getSharedSecret() const;
	std::string getSharedSecretAsHexStr() const;
	char* getSharedSecretAsHexStrPtr() const;

};


