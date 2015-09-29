#!/bin/bash

TMP_DIR='/data/lapig/TMP'

cd $TMP_DIR
find $TMP_PATH -name '*' -atime +30 -exec ls "{}" \;
find '*' -type d -empty -exec ls "{}" \;