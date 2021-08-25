#!/bin/sh
xclip -selection clipboard /home/yky/misc-programs/conceptual-keyboard/load-conkey.txt
beep
firefox about:debugging#/runtime/this-firefox
sleep 1
# **** xdotool sucks, window name search doesn't work
# win_id=$(xdotool search --name --onlyvisible "Debugging - Runtime / this-firefox");
# win_id=$(xdotool search --name --onlyvisible "Firefox");
win_hex_id=$(wmctrl -l | grep 'Debugging - Runtime / this-firefox' | grep -Eo '0x[0-9a-f]+')
win_id=$(printf "%d\n" $win_hex_id)
echo "Win ID =" $win_id
if [ $(hostname) = 'Vivobook' ]; then
	xdotool windowfocus --sync $win_id mousemove 880 320 click 1
else
	xdotool windowfocus --sync $win_id mousemove 228 107 click 3 sleep 1 mousemove 105 265 click 3 sleep 1 mousemove 847 345 click 3
fi
sleep 1
win_id=$(xdotool search --name --onlyvisible "Select manifest.json file")
# echo $win_id
xdotool windowfocus --sync $win_id key ctrl+v sleep 0.5 key Return
# sleep 3

# ***** This part seems to set Chromium windows "always below", but seems not needed
# for winID in $(wmctrl -l | grep -v 'Conceptual Keyboard - Chromium' | grep ' - Chromium' | grep -Eo '^[^ ]+')
# do
# echo $winID
# wmctrl -i -r $winID -b add,below
# done

wmctrl -i -r $(wmctrl -l | grep "Conceptual Keyboard - Chromium" | grep -Eo '^[^ ]+') -b add,above
# wmctrl -i -r $(wmctrl -l | grep " - Mozilla Firefox" | grep -Eo '^[^ ]+') -b add,below
