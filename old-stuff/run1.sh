#!/bin/sh
#
# kill any previous Java Conkey processes:
# ps -C "java -jar dist/conkey.jar" --no-heading --format pid > conkey_PID.txt
# while read p; do
#	kill $p
# done < conkey_PID.txt
##### backup conkey database
cp database_default.txt database_default.bak
##### close terminal window
wmctrl -r :ACTIVE: -b add,hidden
# sleep 1
##### run conkey server
http-server -p 9090 -c-1 &
# java -jar dist/conkey.jar &
##### remember process ID
Conkey_PID=$!
echo "Process ID = " $Conkey_PID
##### wait 2 seconds
sleep 1
##### start chrome browser
chromium-browser --new-window http://localhost:9090/index.html
sleep 2
##### set size and flags of conkey broswer window
wmctrl -r "Conceptual Keyboard" -b remove,maximized_horz,maximized_vert
wmctrl -r "Conceptual Keyboard" -e 1,50,200,520,500
wmctrl -r "Conceptual Keyboard" -b add,above
##### wait for termination
echo "to terminate type: kill $Conkey_PID"
echo $Conkey_PID > conkey_PID.txt
# read abc
# kill $Conkey_PID
