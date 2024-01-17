
#pragma once

#include "aes.h"
// CryptoPP::AES

#include "modes.h"
// CryptoPP::CBC_Mode;
// CryptoPP::CTR_Mode;


class AesSymmetricCipher
{
public:
	AesSymmetricCipher() = default;

public:
	void initializeFromHexStr(
		const std::string& inKey,
		const std::string& inIv
	);

public:
  std::string encryptFromHexStrAsHexStr(const std::string& inHexStr);
  std::string decryptFromHexStrAsHexStr(const std::string& inHexStr);

private:
	CryptoPP::CBC_Mode<CryptoPP::AES>::Encryption _encryption;
	CryptoPP::CBC_Mode<CryptoPP::AES>::Decryption _decryption;
	// CryptoPP::CTR_Mode<CryptoPP::AES>::Encryption _encryption;
	// CryptoPP::CTR_Mode<CryptoPP::AES>::Decryption _decryption;

};

