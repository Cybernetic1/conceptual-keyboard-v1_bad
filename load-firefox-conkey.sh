#!/bin/sh
xclip -selection clipboard /home/yky/misc-programs/conceptual-keyboard/load-conkey.txt
beep
# firefox about:debugging#/runtime/this-firefox &
# echo $win_id
if [ $(hostname) = 'Vivobook' ]; then
	firefox about:debugging#/runtime/this-firefox
	# not sure why but the window name search isn't working
	sleep 0.7
	win_id=$(xdotool search --name --onlyvisible "Firefox");
	# win_id=$(xdotool search --name --onlyvisible "Debugging - Runtime / this-firefox");
	xdotool windowfocus --sync $win_id mousemove 880 320 click 1
else
	firefox about:debugging#/runtime/this-firefox
	sleep 0.5
	win_id=$(xdotool search --name --onlyvisible "Mozilla Firefox");
	xdotool windowfocus --sync $win_id mousemove 228 107 click 3 sleep 1 mousemove 105 265 click 3 sleep 1 mousemove 847 345 click 3
fi
sleep 1.0
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
