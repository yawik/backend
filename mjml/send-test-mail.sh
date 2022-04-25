#!/bin/bash

./build.sh

cat ../config/mails/de/job-created-check.html | mail \
-a "From: bleek@cross-solution.de" \
-a "MIME-Version: 1.0" \
-a "Content-Type: text/html" \
-s "This is the subject" \
bleek@cross-solution.de