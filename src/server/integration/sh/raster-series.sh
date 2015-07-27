#!/bin/bash

IFS=$'\n'

for file in $(cat $1 | grep -i "$2")
do echo -e "$file\t$( gdallocationinfo -wgs84 "$file" $3 $4 | grep "Value" | cut -d':' -f2 )"
done