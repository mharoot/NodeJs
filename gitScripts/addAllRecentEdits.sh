# @task   Place this script in the folder you have initialized a github repository in. Run this script any time to add all recent edits with a commit message if you wish to do so.

# @author Michael Harootoonyan

#!/bin/bash

function isEmpty() {
    if [ -z "$1" ] ; then
      echo "0" # bash treats zero as true
    else
      echo "1"
    fi
}

function addGit() {
    git add .
    # git rm --cached <file> will completely remove the file's contents from the index. This means that on commit the file will be removed from the HEAD commit. (If the file was only added to the index and not yet tracked this is a "no-op".)
    # git reset -- <file> resets the contents of the file in the index to be the same as the head commit. This means that on commit no changes will be committed to the file. This operation is not valid if there is no tracked version of the file in the HEAD commit.
    # git rm --cached addAllRecentEdits.sh
    git rm --cached gitScripts/*
    case $(isEmpty "$1") in
    "0") 
        git commit -m "message n/a";; # commit without message gives default message
    "1") 
        git commit -m "$1" ;; #commit with message
    *) #default case
        echo "error with commit message" ;; 
    esac

    if [ $(isEmpty "$2") == "0" ] ; then 
	git push origin master # empty by default push to origin master
    else
	git push origin "$2"   # push to branch
    fi
}



function main() {
   echo "Enter a message if you'd like with your git commit"
   read commitMessage 
   echo "Enter a branch name if you want to load to a different branch other than master"
   read branch
   addGit "$commitMessage" "$branch" #important to wrap in string because if you type testing addAllRecentEdits.sh script it will drop everything after testing
}

#run main
main $1
