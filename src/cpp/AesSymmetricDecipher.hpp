
#pragma once

#include "aes.h"
// CryptoPP::AES

#include "ccm.h"
// CryptoPP::CBC_Mode;


class AesSymmetricDecipher
{
private:
	CryptoPP::CBC_Mode<CryptoPP::AES>::Decryption _cipher;

public:
	void initializeFromHexStrPtr(
		const void* inKeyPtr,
		std::size_t inKeySize,
		const void* inIvPtr,
		std::size_t inIvSize
	);

	void initializeFromHexStr(
		const std::string_view inKey,
		const std::string_view inIv
	);

	void initializeFromRawPtr(
		const void* inKeyPtr, uint64_t inKeySize,
		const void* inIvPtr, uint64_t inIvSize
	);

public:
  void* decryptFromHexStrPtrAsHexStrPtr(
    const void* inDataPtr,
    std::size_t inDataSize
  );

};

