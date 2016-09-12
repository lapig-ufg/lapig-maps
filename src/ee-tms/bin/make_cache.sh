#!/bin/bash

CACHE_PATTERN='cache.urls'
SERVER_URL='http://maps.lapig.iesa.ufg.br'

for id in $(curl -s $SERVER_URL/tms | grep "<ows:Identifier>l" | cut -b17-36); do
	echo "Caching $id ..."
	filename="/tmp/$id".urls
	for url in $(cat $CACHE_PATTERN | sed s/layer_name/$id/); do
		echo "curl -s \"$SERVER_URL\"\"$url\" > /dev/null" >> $filename
	done
	parallel < $filename &> /dev/null
	rm -v $filename
done