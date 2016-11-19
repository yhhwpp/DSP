#!/bin/bash
if [ $# == 0  ]
 then
   echo 'no arguements'
   exit
fi
echo $1 
cp fis-conf.js fis-conf.js.bk
sed -i "s/http:\/\/192.168.1.240:8001\/bos-backend-api/$1/g" fis-conf.js

