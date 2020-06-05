# Usage: js.sh directory region
# region = se, no, dk
# EXAMPLE ./js.sh . se
#
# extracts and compresses js files to two files, one to be included before the
# html is loaded, and one after sweden.js, norway.js or denmark.js is used to
# implement E.locale, depending on region and the files are called before.js
# and after.js and are placed in directory

set -e

case "$2" in
'se')
    locale='sweden.js';
    ;;
'no')
    locale='norway.js';
    ;;
'dk')
    locale='denmark.js';
    ;;
'pl')
    locale='poland.js';
    ;;
esac


# extract files from html
# =======================

cp ../index.html .
rm -Rf before.js
rm -Rf after.js

extract="0"
while read line; do

    if [[ $line == *JS-BEFORE-END* ]]; then
        extract="0"
    fi

    if [ $extract = "1" ]; then
        file=${line##*'src="'}
        file=${file%%'"'*}

        if [ $file = "sweden.js" ] ||
        [ $file = "norway.js" ] ||
        [ $file = "poland.js" ] ||
        [ $file = "denmark.js" ]; then
            cat ../$locale >> before_uncompressed.js
        else
            cat ../$file >> before_uncompressed.js;
        fi
    fi

    if [[ $line == *JS-BEFORE-BEGIN* ]]; then
        extract="1"
    fi

done < index.html


extract="0"
while read line; do

    if [[ $line == *JS-AFTER-END* ]]; then
        extract="0"
    fi

    if [ $extract = "1" ]; then
        file=${line##*'src="'}
        file=${file%%'"'*}
        if [ -n "$file" ]; then
            cat ../$file >> after_uncompressed.js;
        fi
    fi

    if [[ $line == *JS-AFTER-BEGIN* ]]; then
        extract="1"
    fi

done < index.html


# minify and clean up
# ===================

java -jar yuicompressor-2.4.7.jar -o $1/before.js before_uncompressed.js
java -jar yuicompressor-2.4.7.jar -o $1/after.js after_uncompressed.js

rm before_uncompressed.js after_uncompressed.js index.html
