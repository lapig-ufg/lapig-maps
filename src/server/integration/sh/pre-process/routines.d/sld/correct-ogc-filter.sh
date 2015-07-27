#!/bin/bash

new_filepath=$filepath_noext-new

if [ -n "$(cat $filepath | grep 'PropertyIsGreaterThan>')" ]; then
	log "$filename"

	cat $filepath | sed -e 's/PropertyIsGreaterThan>/PropertyIsGreaterThanOrEqualTo>/g' > $new_filepath.sld

	rm $filepath
	mv $new_filepath.sld $filepath

fi
