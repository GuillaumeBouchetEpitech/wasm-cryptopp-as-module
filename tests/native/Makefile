

DIR_SRC=						./src
DIR_OBJ=						./obj
DIR_APPLICATION=		./bin
DIR_LIB_WRAPPER=		../..

NAME_APPLICATION=		$(DIR_APPLICATION)/exec
NAME_LIB_WRAPPER=		$(DIR_LIB_WRAPPER)/lib/lib-wrapper-cryptopp.a


DIR_LIB_CRYPTOPP=		$(DIR_LIB_WRAPPER)/thirdparties/dependencies/cryptopp
NAME_LIB_CRYPTOPP=	$(DIR_LIB_WRAPPER)/thirdparties/lib/native/lib-cryptopp.a


SRC+= 		$(wildcard $(DIR_SRC)/*.cpp)


OBJ=			$(patsubst %.cpp, $(DIR_OBJ)/%.o, $(SRC))



BUILD_FLAG= -g3

CXX=g++

CXXFLAGS += $(BUILD_FLAG)
CXXFLAGS += -std=c++17
# CXXFLAGS += -Wall -W -Wextra -Wunused -Wpedantic -Wshadow -Wconversion -Werror
CXXFLAGS += -I$(DIR_SRC)
CXXFLAGS += -I$(DIR_LIB_WRAPPER)/src/cpp
CXXFLAGS += -I$(DIR_LIB_CRYPTOPP)
CXXFLAGS += -no-pie

LDFLAGS += $(BUILD_FLAG)
LDFLAGS += $(NAME_LIB_WRAPPER)
LDFLAGS += $(NAME_LIB_CRYPTOPP)

LIBRARIES += gtest_main

CXXFLAGS_LINKER = $(CXXFLAGS)
CXXFLAGS_LINKER += $(shell pkg-config $(LIBRARIES) --cflags)
LDFLAGS_LINKER += $(LDFLAGS)
LDFLAGS_LINKER += $(shell pkg-config $(LIBRARIES) --libs)


RM=					rm -rf


#######

#
## RULE(S)

all:
	$(MAKE) --no-print-directory application

ensure-folders:
	@mkdir -p `dirname $(NAME_APPLICATION)`

application:
	$(MAKE) --no-print-directory ensure-folders
	$(MAKE) --no-print-directory $(OBJ)
	@echo ' ---> building $(LOG_INFO) "application"'
	@$(CXX) $(CXXFLAGS_LINKER) $(OBJ) -o $(NAME_APPLICATION) $(LDFLAGS_LINKER)
	@echo '   --> built $(LOG_INFO) "application"'

#

$(DIR_OBJ)/%.o: %.cpp
	@mkdir -p $(dir $@)
	@echo ' --> processing $(LOG_INFO):' $<
	@$(CXX) $(CXXFLAGS) $< -c -o $@

#

clean:
	@echo ' -> cleaning $(LOG_INFO): application build file(s)'
	@$(RM) $(DIR_OBJ)
	@echo '   -> cleaned $(LOG_INFO): application build file(s)'

fclean:
	$(MAKE) --no-print-directory clean
	@echo ' -> cleaned $(LOG_INFO): application file(s)'
	@$(RM) $(NAME_APPLICATION)
	@echo '   -> cleaned $(LOG_INFO): application file(s)'

re:
	$(MAKE) --no-print-directory fclean
	$(MAKE) --no-print-directory all

.PHONY:	\
	all \
	ensure-folders \
	application \
	clean \
	fclean \
	re

## RULE(S)
#
