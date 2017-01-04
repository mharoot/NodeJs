#!/bin/bash

echo "check the differences between the working directory and the staging area with"
read input

if [ -z "$input" ] ; then 
	echo "no input provided"
else
	echo $(git diff "$input") 
fi


