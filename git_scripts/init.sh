#@task   run this script one time to initialize a github folder
#@author michael harootoonyan
##
#!/bin/bash


function initGit() {
    echo "attempting to init from link: $1"
    git init 
    git remote add origin "$1"
}

function isEmpty() {
    if [ -z "$1" ] ; then
      echo "0" # bash treats zero as true
    else
      echo "1"
    fi
}


function main() {
    echo "Please copy and paste the github respository html link at the top of your browser for the files you wish to download: "
    
    read url

    case $(isEmpty "$url") in #$result in  
    "0") 
        echo "warning: Url not provided, program exiting." ;; 
    "1") 
        initGit "$url" ;; 
    *) #default case
        echo dont know ;; 
    esac
}

#run main
main


