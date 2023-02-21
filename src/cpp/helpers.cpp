
#include "helpers.hpp"

#include "hex.h"
// CryptoPP::HexEncoder
// CryptoPP::HexDecoder

#include <iostream>

namespace helpers {

	std::string decAsHexString(const void* inData, int inSize)
	{
		const uint8_t* pData = reinterpret_cast<const uint8_t*>(inData);
		return decAsHexString(pData, inSize);
	}

	std::string decAsHexString(const uint8_t* inData, int inSize)
	{
		std::string result;
		CryptoPP::StringSource(inData, inSize, true /*pump all*/,
			new CryptoPP::HexEncoder(
				new CryptoPP::StringSink(result)
			) // CryptoPP::HexEncoder
		); // StringSource
		return result;
	}

	std::string decAsHexString(const std::string& inStr)
	{
		const uint8_t* dataPtr = reinterpret_cast<const uint8_t*>(inStr.data());
		return decAsHexString(dataPtr, int(inStr.size()));
	}

	std::string decAsHexString(const std::string_view inStr)
	{
		const uint8_t* dataPtr = reinterpret_cast<const uint8_t*>(inStr.data());
		return decAsHexString(dataPtr, int(inStr.size()));
	}

	std::string hexAsDecString(const void* inData, int inSize)
	{
		const uint8_t* pData = reinterpret_cast<const uint8_t*>(inData);
		return hexAsDecString(pData, inSize);
	}

	std::string hexAsDecString(const uint8_t* inData, int inSize)
	{
		// std::cerr << "step in" << std::endl;

		std::string result;
		CryptoPP::StringSource(inData, inSize, true /*pump all*/,
			new CryptoPP::HexDecoder(
				new CryptoPP::StringSink(result)
			) // HexDecoder
		); // StringSource

		// std::cerr << "step out" << std::endl;

		return result;
	}

	std::string hexAsDecString(const std::string& inStr)
	{
		const uint8_t* dataPtr = reinterpret_cast<const uint8_t*>(inStr.data());
		return hexAsDecString(dataPtr, int(inStr.size()));
	}

	std::string hexAsDecString(const std::string_view inStr)
	{
		const uint8_t* dataPtr = reinterpret_cast<const uint8_t*>(inStr.data());
		return hexAsDecString(dataPtr, int(inStr.size()));
	}

}
