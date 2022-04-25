#!/bin/bash

MJML=../node_modules/.bin/mjml


for file in `ls -1 de/*.mjml`
do 
  $MJML ${file%.*}.mjml --config.filePath ./de/partials/ --output ../config/mails/${file%.*}.html
done


