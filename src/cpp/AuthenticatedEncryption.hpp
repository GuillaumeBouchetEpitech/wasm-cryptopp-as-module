
#pragma once

#include "aes.h"
// CryptoPP::AES

#include "gcm.h"
// CryptoPP::GCM;

#include "ccm.h"
// CryptoPP::CCM;

constexpr int TAG_SIZE = 16;

class AuthenticatedEncryption
{
public:
	AuthenticatedEncryption() = default;

public:
	void initializeFromHexStr(const std::string& inKeyHexStr);

public:
  std::string encryptFromHexStrAsHexStr(const std::string& inDataHexStr, const std::string& inIvHexStr);
  std::string decryptFromHexStrAsHexStr(const std::string& inDataHexStr, uint32_t inSize, const std::string& inIvHexStr);

private:
	CryptoPP::CCM<CryptoPP::AES, TAG_SIZE>::Encryption _encryption;
	CryptoPP::CCM<CryptoPP::AES, TAG_SIZE>::Decryption _decryption;
	// CryptoPP::GCM<CryptoPP::AES>::Encryption _encryption;
	// CryptoPP::GCM<CryptoPP::AES>::Decryption _decryption;

	std::string _key;
};

