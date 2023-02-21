
build_mode=release
# build_mode=debug

#


ifeq ($(build_mode),release)
# $(info build_mode is valid, value=$(build_mode))
else ifeq ($(build_mode),debug)
# $(info build_mode is valid, value=$(build_mode))
else
$(error unsupported value for "build_mode", value=$(build_mode))
endif

#

LOG_INFO= '[$(build_mode)]'

#

DIR_TARGET=					./dist/web-wasm
NAME_APPLICATION=		$(DIR_TARGET)/index.js

#

DIR_LIB_CRYPTOPP=	./thirdparties/dependencies/cryptopp
NAME_LIB_CRYPTOPP=	./thirdparties/lib/web-wasm/lib-cryptopp.bc



#### DIRS

DIR_SRC=														./src
DIR_OBJ=									./obj/web-wasm

#### /DIRS

DIR_DEFINITIONS=					./definitions
DIR_MODULE=								./build

#### SRC

SRC_WASM_MODULE+=	$(wildcard $(DIR_SRC)/cpp/*.cpp)

#

DIR_OBJ_WASM_MODULE=	$(DIR_OBJ)/wasm-module

OBJ_WASM_MODULE=	$(patsubst %.cpp, $(DIR_OBJ_WASM_MODULE)/%.o, $(SRC_WASM_MODULE))

#######


ifeq ($(build_mode),release)

BUILD_FLAG=		-O3 # optimisation flag

else

BUILD_FLAG=		-g3 # debug flag

endif

CXXFLAGS += $(BUILD_FLAG)
CXXFLAGS += -std=c++17
CXXFLAGS += -Wall -W -Wextra -Wunused
CXXFLAGS += -I$(DIR_SRC)
CXXFLAGS += -I$(DIR_LIB_CRYPTOPP)

LDFLAGS += $(BUILD_FLAG)
LDFLAGS += $(NAME_LIB_CRYPTOPP)




CXX=em++
AR=emar
WEBIDL_BINDER=$(EMSDK)/upstream/emscripten/tools/webidl_binder.py

# LDFLAGS_COMMON_WEB_WASM += -s TOTAL_MEMORY=128Mb # 16Kb, 256Mb, etc.
LDFLAGS_COMMON_WEB_WASM += -s TOTAL_MEMORY=8Mb # 16Kb, 256Mb, etc.
LDFLAGS_COMMON_WEB_WASM += -s WASM=1
LDFLAGS_COMMON_WEB_WASM += -s BINARYEN_IGNORE_IMPLICIT_TRAPS=1
LDFLAGS_COMMON_WEB_WASM += -s DISABLE_DEPRECATED_FIND_EVENT_TARGET_BEHAVIOR=0

LDFLAGS_COMMON_WEB_WASM += -s EXPORTED_FUNCTIONS="['_free']"
LDFLAGS_COMMON_WEB_WASM += -s EXPORTED_RUNTIME_METHODS="['cwrap','_malloc','stringToUTF8','lengthBytesUTF8','UTF8ToString']"

# LDFLAGS += $(BUILD_FLAG)
# LDFLAGS += $(NAME_LIB_CRYPTOPP)
LDFLAGS += $(LDFLAGS_COMMON_WEB_WASM)

# # Link Time Optimisation (LTO)
# LDFLAGS+=	--llvm-lto 1MyParentClass



LDFLAGS_MODULE +=	$(LDFLAGS)
LDFLAGS_MODULE +=	-s EXPORT_NAME="wasmCryptoppJs"
LDFLAGS_MODULE +=	-s NO_EXIT_RUNTIME=1
LDFLAGS_MODULE +=	-s NO_FILESYSTEM=0
# LDFLAGS_MODULE +=	-s NO_DYNAMIC_EXECUTION=1
LDFLAGS_MODULE +=	-s MODULARIZE=1
# LDFLAGS_MODULE += -s MAIN_MODULE=1

# include the glue code
LDFLAGS_MODULE+=	--post-js $(DIR_OBJ)/glue.js
LDFLAGS_MODULE+=	--post-js $(DIR_SRC)/js/post.js


ifeq ($(build_mode),debug)

LDFLAGS_MODULE += -s DEMANGLE_SUPPORT=1
# LDFLAGS_MODULE += -s GL_ASSERTIONS=1
# LDFLAGS_MODULE += -s GL_DEBUG=1
# LDFLAGS_MODULE += -s DISABLE_EXCEPTION_CATCHING=2
LDFLAGS_MODULE += -s NO_DISABLE_EXCEPTION_CATCHING
LDFLAGS_MODULE += -s ASSERTIONS

endif




RM=			rm -rf


#######

#
## RULE(S)

# all:	wasm-app	wasm-module
all:
	@$(MAKE) --no-print-directory wasm-module


ensureFolders:
	@mkdir -p `dirname $(NAME_APPLICATION)`
	@mkdir -p $(DIR_OBJ)
	@mkdir -p $(DIR_MODULE)


wasm-module:
	@echo ' ---> building $(LOG_INFO): "wasm module"'
	@$(MAKE) --no-print-directory ensureFolders
	@python $(WEBIDL_BINDER) $(DIR_DEFINITIONS)/wasm-crypto.idl $(DIR_OBJ)/glue
	@$(MAKE) --no-print-directory $(OBJ_WASM_MODULE)
	@$(CXX) $(CXXFLAGS) $(OBJ_WASM_MODULE) -o $(DIR_MODULE)/wasm-cryptopp.js $(LDFLAGS_MODULE)
	@echo '   --> built $(LOG_INFO): "wasm module"'

#

# for every ".cpp" file
# => ensure the "obj" folder(s)
# => compile in a ".o" file

$(DIR_OBJ_WASM_MODULE)/%.o: %.cpp
	@mkdir -p $(dir $@)
	@echo ' ---> processing $(LOG_INFO):' $<
	$(CXX) -c $(CXXFLAGS) -MMD -MT "$@" -MF "$@.dep" -o "$@" $<

include $(shell test -d $(DIR_OBJ_WASM_MODULE) && find $(DIR_OBJ_WASM_MODULE) -name "*.dep")

#
#
#

clean:
	@echo ' -> cleaning $(LOG_INFO): application build file(s)'
	$(RM) $(DIR_OBJ)
	@echo '   -> cleaned $(LOG_INFO): application build file(s)'

fclean:
	@$(MAKE) --no-print-directory clean
	@echo ' -> cleaning $(LOG_INFO): application file(s)'
	$(RM) $(NAME_APPLICATION)
	@echo '   -> cleaned $(LOG_INFO): application file(s)'

re:
	@$(MAKE) --no-print-directory fclean
	@$(MAKE) --no-print-directory all

.PHONY: \
	all \
	ensureFolders \
	wasm-module \
	clean \
	fclean \
	re

## RULE(S)
#
