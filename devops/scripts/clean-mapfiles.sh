#!/bin/bash

TMP_PATH='/mnt/tmpfs'

find $TMP_PATH -name '*sld.map' -amin +1 -exec rm "{}" \;