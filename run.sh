#!/bin/sh
#
# kill any previous Java Conkey processes:
# ps -C "java" --no-heading --format pid > conkey_PID.txt
while read p; do
	kill $p
done < conkey_PID.txt
##### backup conkey database
cd ~/NetBeansProjects/conceptual-keyboard
# cp database_default.txt database_default.bak
##### close terminal window
# wmctrl -r :ACTIVE: -b add,hidden
sleep 1
##### run conkey server
# http-server /home/yky/NetbeansProjects/conceptual-keyboard/web -p 9090 -c-1
java -jar target/conkey-1.0-SNAPSHOT.jar &
mplayer chrome-extension/ip203_alert.ogg
##### remember process ID, so as to delete it later
Conkey_PID=$!
echo $Conkey_PID > conkey_PID.txt
##### wait 2 seconds
sleep 1
##### start chrome browser
if google-chrome --version >/dev/null; then
    google-chrome --new-window http://localhost:9090/index.html
else
    chromium-browser --new-window http://localhost:9090/index.html
fi
sleep 2
##### set size and flags of conkey broswer window
wmctrl -r "Conceptual Keyboard" -b remove,maximized_horz,maximized_vert
wmctrl -r "Conceptual Keyboard" -e 1,50,200,520,500
wmctrl -r "Conceptual Keyboard" -b add,above
##### wait for termination
# echo "to terminate type: kill $Conkey_PID"
# echo $Conkey_PID > conkey_PID.txt
# read abc
# kill $Conkey_PID
