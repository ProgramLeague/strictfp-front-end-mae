#!/bin/sh

# Author: AkimotoAkari (AkirisWu) 2017
# Arguments: $1: input file, $2: output path (abs. path)

uglifyjs --define DEBUG=false -cm -o "$2" "$1"
exit $?