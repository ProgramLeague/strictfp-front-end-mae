#!/bin/bash

# Author: AkimotoAkari (Akiris Wu) 2017

# Origin: http://blog.csdn.net/xiuzhentianting/article/details/53364078
totalsteps=0
currentstep=0

onerror(){
	# Some kinds of event listeners
	echo -e "\n\033[31mOops! Something went wrong...\033[0m"
	exit 1
}
getabspathoffile(){
	echo $(cd `dirname $0`; pwd)
}
getname(){
	echo "${1%.*}"
}
getextname(){
	echo "${1##*.}"
}
getrelpath(){
	# $1: base, $2: target
	echo ${2:${#1}+1}
}
contains(){
	return `[[ "$1" == *"$2"* ]]`;
}
addattr(){
	dirabs=`getabspathoffile "$1"`
	filename=`getname "$1"`
	fileext=`getextname "$1"`
	echo "$dirabs/$filename.$2.$fileext"
}
_proc(){
	currentstep=`expr $currentstep + 1`
	# $1: file hint, $2: dir, $3: preprocessor type, $4: restricted file extname
	echo -e "\033[32m[$currentstep/$totalsteps] Compressing $1...\033[0m"
	echo ""
	
	foreachd "$base/$2" "$output/$2" "$3" 0 "$4" 0
	ret=$?
	if [ $ret != 0 ]; then
		onerror
		# should not return..
		return 1
	fi
	return 0
}
_copy(){
	currentstep=`expr $currentstep + 1`
	# $1: file hint, $2: dir, $3: restricted file extname
	echo -e "\033[32m[$currentstep/$totalsteps] Copying $1...\033[0m"
	echo ""
	
	foreachd "$base/$2" "$output/$2" "direct" 0 "$3" 1
	ret=$?
	if [ $ret != 0 ]; then
		onerror
		# should not return..
		return 1
	fi
	return 0
}

foreachd(){
	# $1: basepath, $2: output dir (w/ type suffix), 
	# $3: processor type, $4: recursive, 0: yes, $5: restricted file extname, $6: copy files with improper extname
	# NOTE: all paths SHOULD NOT end with /.
	for filepath in ${1}/*; do
		if [ ! -d "$filepath" ] && [[ "$filepath" != *"*"* ]] ; then
			# Arguments gotten in processor:
			# $1: path to file, $2: output file (w/ type suffix), 
			# $3: filename

			filename=`basename "$filepath"`
			relpath=`getrelpath ${base} ${filepath}`
			outfile="$2/$filename"
			outfile=`addattr "$outfile" "min"`

			#first check if dirs exist.
			if [ ! -d `dirname "$outfile"` ]; then
				echo `dirname "$outfile"`
				mkdir -p `dirname "$outfile"`
			fi

			if [ -n "$5" ] && [ `getextname "$filename"` != "$5" ] && [ "$6" ]; then
				temp=`basename "$filepath"`
				if ! cp "$filepath" "$2/$temp" ; then
					echo -e "\033[31mError occurred while copying file: \033[0m$filepath"
					return 1
				fi
				continue
			fi

			if contains "$filename" ".min." ; then
				# minified file, do not process them.
				echo "$filepath" "$2/`basename "$filepath"`"
				if ! cp "$filepath" "$2/`basename "$filepath"`" ; then
					echo -e "\033[31mError occurred while copying file: \033[0m$filepath"
					return 1
				fi
			else
				# Arguments: $1: input file, $2: output file path (abs. path)
				echo -e "\t\033[34m$relpath\033[0m"
				if ! "./build-scripts/proc-$3.sh" "$filepath" "$outfile"; then
					echo -e "\033[31mError occurred while processing file: \033[0m$filepath"
					return 1
				fi
			fi
		else
			if [ "$4" ] && [[ "$filepath" != *"*"* ]]; then
				foreachd "$filepath" "$2/`getrelpath "$1" "$filepath"`" "$3" "$4" "$5" "$6"
				return $? # Bubbling!
			fi
		fi
	done
	return 0
}

# MAIN ENTRY IS HERE
base=`dirname $0`
output="$base/build"
totalsteps=6
ver=290125

echo -e "\033[35m\x20\x5f\x5f\x5f\x5f\x20\x20\x5f\x20\x20\x20\x20\x20\x20\x20\x20\x5f\x20\x20\x20\x20\x20\x20\x5f\x20\x20\x20\x20\x5f\x5f\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x5f\x5f\x20\x20\x5f\x5f\x20\x20\x20\x20\x5f\x20\x20\x20\x20\x5f\x5f\x5f\x5f\x5f\x0a\x2f\x20\x5f\x5f\x5f\x7c\x7c\x20\x7c\x5f\x20\x5f\x20\x5f\x5f\x28\x5f\x29\x20\x5f\x5f\x5f\x7c\x20\x7c\x5f\x20\x2f\x20\x5f\x7c\x5f\x20\x5f\x5f\x20\x20\x20\x20\x20\x20\x20\x7c\x20\x20\x5c\x2f\x20\x20\x7c\x20\x20\x2f\x20\x5c\x20\x20\x7c\x20\x5f\x5f\x5f\x5f\x7c\x0a\x5c\x5f\x5f\x5f\x20\x5c\x7c\x20\x5f\x5f\x7c\x20\x27\x5f\x5f\x7c\x20\x7c\x2f\x20\x5f\x5f\x7c\x20\x5f\x5f\x7c\x20\x7c\x5f\x7c\x20\x27\x5f\x20\x5c\x20\x5f\x5f\x5f\x5f\x5f\x7c\x20\x7c\x5c\x2f\x7c\x20\x7c\x20\x2f\x20\x5f\x20\x5c\x20\x7c\x20\x20\x5f\x7c\x0a\x20\x5f\x5f\x5f\x29\x20\x7c\x20\x7c\x5f\x7c\x20\x7c\x20\x20\x7c\x20\x7c\x20\x28\x5f\x5f\x7c\x20\x7c\x5f\x7c\x20\x20\x5f\x7c\x20\x7c\x5f\x29\x20\x7c\x5f\x5f\x5f\x5f\x5f\x7c\x20\x7c\x20\x20\x7c\x20\x7c\x2f\x20\x5f\x5f\x5f\x20\x5c\x7c\x20\x7c\x5f\x5f\x5f\x0a\x7c\x5f\x5f\x5f\x5f\x2f\x20\x5c\x5f\x5f\x7c\x5f\x7c\x20\x20\x7c\x5f\x7c\x5c\x5f\x5f\x5f\x7c\x5c\x5f\x5f\x7c\x5f\x7c\x20\x7c\x20\x2e\x5f\x5f\x2f\x20\x20\x20\x20\x20\x20\x7c\x5f\x7c\x20\x20\x7c\x5f\x2f\x5f\x2f\x20\x20\x20\x5c\x5f\x5c\x5f\x5f\x5f\x5f\x5f\x7c\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x7c\x5f\x7c\x0a\033[37m\n\n\t\tStrictfp-MAE Prebuilder\033[0m\n"

echo -e "\n\033[32m[1/$totalsteps] Cleaning up...\033[0m"
currentstep=`expr $currentstep + 1`
rm -rf ./build
# $1: file hint, $2: dir, $3: preprocessor type, $4, $5, $6: restricted file extname
_proc "CSS files" "assets/$ver/css" "css" "css"
_proc "JavaScript files" "assets/$ver/js" "js" "js"

# $1: file hint, $2: dir, $3, $4, $5: restricted file extname
_copy "HTMLs" "." "html"
_copy "templates" "assets/$ver/templates"
_copy "static files" "assets/$ver/static"


echo -e "\n\033[32mDone, have fun!\033[0m"