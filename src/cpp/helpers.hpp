
#pragma once

#include <string>
#include <cstdint>

namespace helpers {

	std::string decAsHexString(const void* inData, int inSize);
	std::string decAsHexString(const uint8_t* inData, int inSize);
	std::string decAsHexString(const std::string& inStr);
	std::string decAsHexString(const std::string_view inStr);

	std::string hexAsDecString(const void* inData, int inSize);
	std::string hexAsDecString(const uint8_t* inData, int inSize);
	std::string hexAsDecString(const std::string& inStr);
	std::string hexAsDecString(const std::string_view inStr);

}
