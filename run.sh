#!/bin/sh
cd /home/yky/misc-programs/conceptual-keyboard
# kill any previous Java Conkey processes:
while read p; do
	kill $p
done < conkey_PID.txt
##### backup conkey database
# cp database_default.txt database_default.bak
##### close terminal window
# wmctrl -r :ACTIVE: -b add,hidden
sleep 0.5
##### run conkey server
node SSE-server.js &
# mplayer --quiet chrome-extension/ip203_alert.ogg
##### remember process ID, so as to delete it later
Conkey_PID=$!
echo $Conkey_PID > conkey_PID.txt
sleep 1.5
##### start chrome browser
# vivaldi --app=http://localhost:8484/index.html
chromium-browser --app=http://localhost:8484/Cantonese-input.html
# if google-chrome --version >/dev/null; then
    # google-chrome --new-window http://localhost:8484/index.html
# else
#    chromium-browser --app=http://localhost:8484/index.html
# fi
sleep 2.5
##### set size and flags of Conkey broswer window
wmctrl -r "iCant" -b remove,maximized_horz,maximized_vert
wmctrl -r "iCant" -e 1,500,200,620,450
wmctrl -r "iCant" -b add,above
