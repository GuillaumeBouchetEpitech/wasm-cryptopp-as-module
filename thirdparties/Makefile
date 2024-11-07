
build_platform=native
# build_platform=web-wasm

build_mode=release
# build_mode=debug

#

ifeq ($(build_platform),native)
# $(info build_platform is valid, value=$(build_platform))
else ifeq ($(build_platform),web-wasm)
# $(info build_platform is valid, value=$(build_platform))
else
$(error unsupported value for "build_platform", value=$(build_platform))
endif

ifeq ($(build_mode),release)
# $(info build_mode is valid, value=$(build_mode))
else ifeq ($(build_mode),debug)
# $(info build_mode is valid, value=$(build_mode))
else
$(error unsupported value for "build_mode", value=$(build_mode))
endif


LOG_INFO= '[$(build_mode)] [$(build_platform)]'

#

ifeq ($(build_platform),native)

DIR_LIB=		./lib/native

NAME_CRYPTOPP=			$(DIR_LIB)/lib-cryptopp.a
NAME_CRYPTOPP_PEM=	$(DIR_LIB)/lib-cryptopp-pem.a

else ifeq ($(build_platform),web-wasm)

DIR_LIB=		./lib/web-wasm

NAME_CRYPTOPP=			$(DIR_LIB)/lib-cryptopp.bc
NAME_CRYPTOPP_PEM=	$(DIR_LIB)/lib-cryptopp-pem.bc

endif



#### DIRS

DIR_DEPENDENCIES=		./dependencies
DIR_CRYPTOPP_SRC=		$(DIR_DEPENDENCIES)/cryptopp
DIR_CRYPTOPP_PEM_SRC=		$(DIR_DEPENDENCIES)/cryptopp-pem

#### /DIRS



ifeq ($(build_platform),native)

DIR_OBJ=	./obj/native

else ifeq ($(build_platform),web-wasm)

DIR_OBJ=	./obj/web-wasm

endif

DIR_OBJ_CRYPTOPP=		$(DIR_OBJ)/cryptopp
DIR_OBJ_CRYPTOPP_PEM=		$(DIR_OBJ)/cryptopp-pem


#### SRC


SRC_CRYPTOPP += $(wildcard $(DIR_CRYPTOPP_SRC)/*.cpp)
SRC_CRYPTOPP := $(filter-out $(DIR_CRYPTOPP_SRC)/bench*.cpp, $(SRC_CRYPTOPP))
SRC_CRYPTOPP := $(filter-out $(DIR_CRYPTOPP_SRC)/datatest.cpp, $(SRC_CRYPTOPP))
SRC_CRYPTOPP := $(filter-out $(DIR_CRYPTOPP_SRC)/test.cpp, $(SRC_CRYPTOPP))
SRC_CRYPTOPP := $(filter-out $(DIR_CRYPTOPP_SRC)/validat*.cpp, $(SRC_CRYPTOPP))

SRC_CRYPTOPP_PEM += $(wildcard $(DIR_CRYPTOPP_PEM_SRC)/*.cpp)

#

OBJ_CRYPTOPP=	$(patsubst %.cpp, $(DIR_OBJ_CRYPTOPP)/%.o, $(SRC_CRYPTOPP))

OBJ_CRYPTOPP_PEM=	$(patsubst %.cpp, $(DIR_OBJ_CRYPTOPP_PEM)/%.o, $(SRC_CRYPTOPP_PEM))

#

#######


ifeq ($(build_mode),release)

BUILD_FLAG= -O3

else

BUILD_FLAG= -g3

endif



CXXFLAGS += $(BUILD_FLAG)
CXXFLAGS += -std=c++17
CXXFLAGS += -w # disable warnings
CXXFLAGS += -DCRYPTOPP_DISABLE_ASM
CXXFLAGS += -DCRYPTOPP_DISABLE_DATA_DIR_SEARCH
CXXFLAGS += -I$(DIR_CRYPTOPP_SRC)

CXXFLAGS_PEM += $(CXXFLAGS)
CXXFLAGS_PEM += -I$(DIR_CRYPTOPP_PEM_SRC)

LDFLAGS += -msse2
LDFLAGS += -msse3
LDFLAGS += -mssse3
LDFLAGS += -msse4.1
LDFLAGS += -msse4.2
LDFLAGS += -mpclmul
LDFLAGS += -maes
LDFLAGS += -mavx
LDFLAGS += -mavx2
LDFLAGS += -msha
LDFLAGS += -msimd128


ifeq ($(build_platform),native)

CXX=clang++
AR=ar

else ifeq ($(build_platform),web-wasm)

CXX=em++
AR=emar

endif


RM=			rm -rf


#######

#
## RULE(S)

all:  libcryptopp libcryptopp-pem

ensure-folders:
	@mkdir -p $(DIR_LIB)

libcryptopp: ensure-folders $(OBJ_CRYPTOPP)
	@echo ' ---> building $(LOG_INFO): "cryptopp library"'
	@$(AR) cr $(NAME_CRYPTOPP) $(OBJ_CRYPTOPP)
	@echo '   --> built $(LOG_INFO): "cryptopp library"'

libcryptopp-pem: ensure-folders $(OBJ_CRYPTOPP_PEM)
	@echo ' ---> building $(LOG_INFO): "cryptopp-pem library"'
	@$(AR) cr $(NAME_CRYPTOPP_PEM) $(OBJ_CRYPTOPP_PEM)
	@echo '   --> built $(LOG_INFO): "cryptopp-pem library"'

#

# for every ".cpp" file
# => ensure the "obj" folder(s)
# => compile in a ".o" file

$(DIR_OBJ_CRYPTOPP)/%.o: %.cpp
	@mkdir -p $(dir $@)
	@echo ' --> processing $(LOG_INFO):' $<
	@$(CXX) $(CXXFLAGS) $< -c -o $@ $(LDFLAGS)

$(DIR_OBJ_CRYPTOPP_PEM)/%.o: %.cpp
	@mkdir -p $(dir $@)
	@echo ' --> processing $(LOG_INFO):' $<
	@$(CXX) $(CXXFLAGS_PEM) $< -c -o $@ $(LDFLAGS)

#

clean:
	@echo ' -> cleaning $(LOG_INFO): cryptopp library build file(s)'
	@$(RM) $(DIR_OBJ_CRYPTOPP)
	@echo '   -> cleaned $(LOG_INFO): cryptopp library build file(s)'
	@echo ' -> cleaning $(LOG_INFO): cryptopp-pem library build file(s)'
	@$(RM) $(DIR_OBJ_CRYPTOPP_PEM)
	@echo '   -> cleaned $(LOG_INFO): cryptopp-pem library build file(s)'

fclean:  clean
	@echo ' -> cleaning $(LOG_INFO): cryptopp library file(s)'
	@$(RM) $(NAME_CRYPTOPP)
	@echo '   -> cleaned $(LOG_INFO): cryptopp library file(s)'
	@echo ' -> cleaning $(LOG_INFO): cryptopp-pem library file(s)'
	@$(RM) $(NAME_CRYPTOPP_PEM)
	@echo '   -> cleaned $(LOG_INFO): cryptopp-pem library file(s)'

re: fclean  all

.PHONY:	\
		all \
		ensure-folders \
		libcryptopp \
		libcryptopp-pem \
		clean \
		fclean \
		re

## RULE(S)
#
