
#pragma once

#include <string>
#include <cstdint>

namespace helpers {


	std::string byteBuffer_to_hexStr(const uint8_t* inDataPtr, std::size_t inDataLength);
	std::string byteBuffer_to_hexStr(const std::string_view inStr);

	std::string hexStr_to_byteBuffer(const uint8_t* inDataPtr, std::size_t inDataLength);
	std::string hexStr_to_byteBuffer(const std::string_view inStr);

}
