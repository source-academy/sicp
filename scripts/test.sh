#! /usr/bin/env bash

JS_SLANG="node node_modules/js-slang/dist/repl/repl.js"

# must use BSD awk
AWK="awk"

SOURCEFILES=js_programs/*/*/*/*.js

DEFAULT_CHAPTER=4
DEFAULT_VARIANT="default"

red=`tput setaf 1`
green=`tput setaf 2`
normal=`tput setaf 7`

passed=0
failed=0

# $1 is the source file to be tested
# $2 is the test file
# $3 is the chapter
# $4 is the variant

test_source() {
#    echo $1
#    echo "$(cat $1 | tail -1 | cut -c 1-11)"
    if [  "$(cat $1 | tail -1 | cut -c 1-11)" = "// result: " ]
    then
	echo "$(cat $1 | tail -1)"
        DIFF=$(diff <($JS_SLANG -e --chapter=$2 "$(cat $1)") \
	            <(cat $1 | tail -1 | cut -c12-))
	if [ "$DIFF" = "" ]
	then passed=$(($passed+1)); echo "${green}PASS $1"
	else failed=$(($failed+1)); echo "${red}FAIL $1:
$DIFF"
	fi
    fi    
}

main() {
    for s in ${SOURCEFILES}
    do
        DIR=$(dirname ${s})	
	# check if first line of test file contains 'chapter=' and retrieve its value. Set to the default chapter if it does not
	chapter=$($AWK -F 'chapter=' 'FNR==1{ if ($0~"chapter=") { print $2 } else { print '$DEFAULT_CHAPTER' } }' $s | $AWK -F ' ' '{ print $1 }')
        
	# check if first line of test file contains 'variant=' and retrieve its value. Set to the default variant if it does not
	variant=$($AWK -F 'variant=' 'FNR==1{ if ($0~"variant=") { print $2 } else { print '$DEFAULT_VARIANT' } }' $s | $AWK -F ' ' '{ print $1 }')
	test_source ${s} ${chapter} ${variant}
    done
}

main
echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0
