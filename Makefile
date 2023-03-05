
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

#

LOG_INFO= '[$(build_mode)] [$(build_platform)]'

#

#### DIRS

DIR_SRC=		./src
DIR_LIB=		./lib
DIR_MODULE=	./build


ifeq ($(build_platform),native)

DIR_OBJ=		./obj/native

NAME_LIB=		$(DIR_LIB)/lib-wrapper-cryptopp.a

else ifeq ($(build_platform),web-wasm)

DIR_OBJ=				./obj/web-wasm

NAME_MODULE=	$(DIR_MODULE)/wasm-cryptopp.js

endif

#
#
#

#
#
#

DIR_LIB_CRYPTOPP=		./thirdparties/dependencies/cryptopp

ifeq ($(build_platform),native)
NAME_LIB_CRYPTOPP=	./thirdparties/lib/native/lib-cryptopp.a
else ifeq ($(build_platform),web-wasm)
NAME_LIB_CRYPTOPP=	./thirdparties/lib/web-wasm/lib-cryptopp.bc
endif

#
#
#

#
#
#

#### SRC

SRC+=	$(wildcard $(DIR_SRC)/cpp/*.cpp)

ifeq ($(build_platform),web-wasm)
SRC+=	$(wildcard $(DIR_SRC)/cpp/wasm-module/*.cpp)
endif

#

OBJ=	$(patsubst %.cpp, $(DIR_OBJ)/%.o, $(SRC))

#######

#
#

ifeq ($(build_platform),native)

CXX=g++
AR=ar

else ifeq ($(build_platform),web-wasm)

CXX=						em++
AR=							emar

endif

#
#

RM=							rm -rf

#
#

ifeq ($(build_mode),release)
BUILD_FLAG=		-O3 # optimisation flag
else
BUILD_FLAG=		-g3 # debug flag
endif

#
#

CXXFLAGS += $(BUILD_FLAG)
CXXFLAGS += -std=c++17
CXXFLAGS += -Wall -W -Wextra -Wunused
CXXFLAGS += -I$(DIR_SRC)
CXXFLAGS += -I$(DIR_LIB_CRYPTOPP)

LDFLAGS += $(BUILD_FLAG)
LDFLAGS += $(NAME_LIB_CRYPTOPP)


ifeq ($(build_platform),native)

else ifeq ($(build_platform),web-wasm)

CXXFLAGS += -lembind


LDFLAGS += -s TOTAL_MEMORY=8Mb # 16Kb, 256Mb, etc.
LDFLAGS += -s WASM=1
LDFLAGS += -s BINARYEN_IGNORE_IMPLICIT_TRAPS=1
LDFLAGS += -s DISABLE_DEPRECATED_FIND_EVENT_TARGET_BEHAVIOR=0

LDFLAGS += -s EXPORTED_FUNCTIONS="['_free']"
LDFLAGS += -s EXPORTED_RUNTIME_METHODS="['cwrap','_malloc','stringToUTF8','lengthBytesUTF8','UTF8ToString']"

LDFLAGS += -s EXPORT_NAME="wasmCryptoppJs"
LDFLAGS += -s NO_EXIT_RUNTIME=1
LDFLAGS += -s NO_FILESYSTEM=0
# LDFLAGS += -s NO_DYNAMIC_EXECUTION=1
LDFLAGS += -s MODULARIZE=1
LDFLAGS +=	--post-js $(DIR_SRC)/js/post.js

ifeq ($(build_mode),debug)

LDFLAGS += -s DEMANGLE_SUPPORT=1
LDFLAGS += -s NO_DISABLE_EXCEPTION_CATCHING
LDFLAGS += -s ASSERTIONS

endif

endif

#
#
#

#######

#
## RULE(S)

ifeq ($(build_platform),native)

all:
	@$(MAKE) --no-print-directory native-lib

else ifeq ($(build_platform),web-wasm)

all:
	@$(MAKE) --no-print-directory wasm-module

endif


ensure-folders:
	@mkdir -p $(DIR_LIB)
	@mkdir -p $(DIR_MODULE)
	@mkdir -p $(DIR_OBJ)




ifeq ($(build_platform),native)

native-lib:
	@echo ' ---> building $(LOG_INFO): "native lib"'
	@$(MAKE) --no-print-directory ensure-folders
	@$(MAKE) --no-print-directory $(OBJ)
	@$(AR) cr $(NAME_LIB) $(OBJ)
	@echo '   --> built $(LOG_INFO): "native lib"'

else ifeq ($(build_platform),web-wasm)

wasm-module:
	@echo ' ---> building $(LOG_INFO): "wasm module"'
	@$(MAKE) --no-print-directory ensure-folders
	@$(MAKE) --no-print-directory $(OBJ)
	@$(CXX) $(CXXFLAGS) $(OBJ) -o $(NAME_MODULE) $(LDFLAGS)
	@echo '   --> built $(LOG_INFO): "wasm module"'

endif




#

# for every ".cpp" file
# => ensure the "obj" folder(s)
# => compile in a ".o" file

$(DIR_OBJ)/%.o: %.cpp
	@mkdir -p $(dir $@)
	@echo ' ---> processing $(LOG_INFO):' $<
	@$(CXX) -c $(CXXFLAGS) -MMD -MT "$@" -MF "$@.dep" -o "$@" $<

include $(shell test -d $(DIR_OBJ) && find $(DIR_OBJ) -name "*.dep")

#
#
#

clean:
	@echo ' -> cleaning $(LOG_INFO): application build file(s)'
	@$(RM) $(DIR_OBJ)
	@echo '   -> cleaned $(LOG_INFO): application build file(s)'

fclean:
	@$(MAKE) --no-print-directory clean
	@echo ' -> cleaning $(LOG_INFO): application file(s)'
	@$(RM) $(DIR_MODULE)
	@echo '   -> cleaned $(LOG_INFO): application file(s)'

re:
	@$(MAKE) --no-print-directory fclean
	@$(MAKE) --no-print-directory all

.PHONY: \
	all \
	ensure-folders \
	native-lib \
	wasm-module \
	clean \
	fclean \
	re

## RULE(S)
#
