#!/bin/bash

CWD=`pwd`

for file in `ls -1 de/*.mjml`
do 
  yarn mjml ${PWD}/${file%.*}.mjml --config.filePath ${PWD}/de/partials/ -o ${PWD}/../config/mails/${file%.*}.html
done


