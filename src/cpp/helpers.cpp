
#include "helpers.hpp"

#include "hex.h"
// CryptoPP::HexEncoder
// CryptoPP::HexDecoder

#include <iostream>

namespace helpers {

	std::string byteBuffer_to_hexStr(const uint8_t* inDataPtr, std::size_t inDataLength)
	{
		std::string result;
		CryptoPP::StringSource(inDataPtr, inDataLength, true /*pump all*/,
			new CryptoPP::HexEncoder(
				new CryptoPP::StringSink(result)
			) // CryptoPP::HexEncoder
		); // StringSource
		return result;
	}

	std::string byteBuffer_to_hexStr(const std::string_view inStr)
	{
		const uint8_t* pData = reinterpret_cast<const uint8_t*>(inStr.data());
		return byteBuffer_to_hexStr(pData, inStr.size());
	}

	//
	//
	//

	std::string hexStr_to_byteBuffer(const std::string_view inStr)
	{
		const uint8_t* pData = reinterpret_cast<const uint8_t*>(inStr.data());
		return hexStr_to_byteBuffer(pData, inStr.size());
	}

	std::string hexStr_to_byteBuffer(const uint8_t* inDataPtr, std::size_t inDataLength)
	{
		std::string result;
		CryptoPP::StringSource(inDataPtr, inDataLength, true /*pump all*/,
			new CryptoPP::HexDecoder(
				new CryptoPP::StringSink(result)
			) // HexDecoder
		); // StringSource
		return result;
	}


	// std::vector<unsigned char> hexStr_to_byteBuffer2(const uint8_t* inDataPtr, std::size_t inDataLength)
	// {
	// 	// const uint8_t* pData = reinterpret_cast<const uint8_t*>(inStr.data());
	// 	// return hexStr_to_byteBuffer(pData, inStr.size());

	// 	std::vector<unsigned char> lol_vector;
	// 	lol_vector.resize(1024);
	// 	auto mySink = new CryptoPP::ArraySink(lol_vector.data(), lol_vector.size());

	// 	std::string result;
	// 	CryptoPP::StringSource(inDataPtr, inDataLength, true /*pump all*/,
	// 		new CryptoPP::HexDecoder(
	// 			// new CryptoPP::StringSink(result)
	// 			mySink
	// 		) // HexDecoder
	// 	); // StringSource

	// 	lol_vector.resize(mySink->TotalPutLength());

	// 	return lol_vector;
	// }

}
