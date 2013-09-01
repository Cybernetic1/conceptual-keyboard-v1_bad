#!/bin/sh
# echo "Press any key to start"
# read abc
cp web/database_default.txt web/database_default.bak
java -jar dist/conkey.jar &
Conkey_PID=$!
echo "Process ID = " $Conkey_PID
sleep 2
chromium-browser localhost:9090/index.html --new-window
sleep 1
wmctrl -r Conceptual -b remove,maximized_horz,maximized_vert
wmctrl -r Conceptual -e 1,50,200,420,400
wmctrl -r Conceptual -b add,above
echo -n "Press any key to kill " $Conkey_PID
read abc
kill $Conkey_PID
