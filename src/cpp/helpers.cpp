
#include "helpers.hpp"

#include "hex.h"
// CryptoPP::HexEncoder
// CryptoPP::HexDecoder

#include <iostream>

namespace helpers {

	std::string decAsHexString(const std::string_view inStr)
	{
		const uint8_t* pData = reinterpret_cast<const uint8_t*>(inStr.data());
		std::string result;
		CryptoPP::StringSource(pData, inStr.size(), true /*pump all*/,
			new CryptoPP::HexEncoder(
				new CryptoPP::StringSink(result)
			) // CryptoPP::HexEncoder
		); // StringSource
		return result;
	}

	//
	//
	//

	std::string hexAsDecString(const std::string_view inStr)
	{
		const uint8_t* pData = reinterpret_cast<const uint8_t*>(inStr.data());
		std::string result;
		CryptoPP::StringSource(pData, inStr.size(), true /*pump all*/,
			new CryptoPP::HexDecoder(
				new CryptoPP::StringSink(result)
			) // HexDecoder
		); // StringSource
		return result;
	}

}
