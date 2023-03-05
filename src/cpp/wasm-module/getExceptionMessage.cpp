
#include "getExceptionMessage.hpp"

std::string getExceptionMessage(int exceptionPtr)
{
  return std::string(reinterpret_cast<std::exception*>(exceptionPtr)->what());
}
