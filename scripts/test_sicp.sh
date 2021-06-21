#! /usr/bin/env bash

OUT_WRITER="test_node_env/index.js"
EXP_WRITER="test_node_env/expected_writer.js"
EXPECTED_ERROR_PATHS="test_node_env/expected_error_paths.txt"

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
# $2 is the chapter
# $3 is the variant

test_source() {
#    echo "one is $1"
#    echo "two is $2"
#    echo "three is $3"
    if [ $3 ];  then
	variant=$3
    else
	variant=$DEFAULT_VARIANT
    fi
	
#	 echo "$(cat $1 | tail -1 | cut -c 1-13)"
    if [  "$(cat $1 | tail -1 | cut -c 1-13)" = "// expected: " ] && [ "$3" != "non-det" ] && [ "$3" != "concurrent" ]
    then
	EXPECTED=`cat $1 | tail -1 | cut -c14-`

		if [[ "$EXPECTED" != "'all threads terminated'" ]]
		then
		echo "${normal}$1, expecting: $(cat $1 | tail -1 | cut -c14-)"
			# Detele the last line of a writers
			sed -i '' -e '$ d' $OUT_WRITER
			sed -i '' -e '$ d' $EXP_WRITER

			# Append the new last line of a writers
			echo "let s = new Script(readFileSync(\"$1\"));" >> $OUT_WRITER
			echo "let e = new Script(\`$EXPECTED\`);" >> $EXP_WRITER

			# Run the writters
			node --stack_size=5000 $OUT_WRITER
			node $EXP_WRITER

			# Compare outputs
			DIFF=$(diff test_node_env/out.txt test_node_env/expected.txt)

			if [ "$DIFF" = "" ]
			then passed=$(($passed+1)); echo "${green}PASS"
			else failed=$(($failed+1)); echo "${red}FAIL:
$DIFF"
	# echo "$1" >> new_error.txt
	fi
    fi   
	fi 
}

main() {
    for s in ${SOURCEFILES}
    do
	# DIR is full path including js_programs
        DIR=$(dirname ${s})
	# CHAPTERDIR is path starting with chapterx
	CHAPTERDIR=${DIR#*/}
	# CHAPTER is just the chapter name, e.g. chapter2
	CHAPTER=${CHAPTERDIR%%/*}
	# SECTIONDIR is path starting with sectionx
	SECTIONDIR=${CHAPTERDIR#*/}
	# SECTION is just the section name, e.g. section3
	SECTION=${SECTIONDIR%%/*}

	declare -a EXPECTED_ERROR_PATH
	INDEX=0
	while read -r LINE
	do
		EXPECTED_ERROR_PATH[$INDEX]=$LINE
		((INDEX++))
	done < $EXPECTED_ERROR_PATHS

	if [[ ($1 == $CHAPTER || $1 == "") && ($2 == $SECTION || $2 == "") && ( ! " ${EXPECTED_ERROR_PATH[@]} " =~ " ${s} " )]];
	then
	    # check if first line of test file contains 'chapter=' and retrieve
	    # its value. Set to the default chapter if it does not
	    chapter=$($AWK -F 'chapter=' 'FNR==1{ if ($0~"chapter=") { print $2 } else { print '$DEFAULT_CHAPTER' } }' $s | $AWK -F ' ' '{ print $1 }')
            
	    # check if first line of test file contains 'variant=' and retrieve
	    # its value. Set to the default variant if it does not
	    variant=$($AWK -F 'variant=' 'FNR==1{ if ($0~"variant=") { print $2 } else { print '$DEFAULT_VARIANT' } }' $s | $AWK -F ' ' '{ print $1 }')
	    test_source ${s} ${chapter} ${variant}
	fi
    done
}

# optional arguments: chapter... section..., limiting testing only to the
# named chapter (or section): e.g. yarn test chapter2 section3

# Comment the main if you just want to see the error paths
main $1 $2

echo "expected error path: "
while read -r LINE
	do
		test_source $LINE
	done < $EXPECTED_ERROR_PATHS

echo "${normal}test cases completed; $passed passed, $failed failed"
exit 0