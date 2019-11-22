#!/bin/sh
xclip -selection clipboard /home/yky/misc-programs/conceptual-keyboard/load-conkey.txt
beep
# firefox about:debugging#/runtime/this-firefox &
sleep 0.5
win_id=$(xdotool search --name --onlyvisible "Debugging - Runtime / this-firefox")
# echo $win_id
if [ $(hostname) = 'Vivobook' ]; then
	xdotool windowfocus --sync $win_id mousemove 880 369 click 1
else
	xdotool windowfocus --sync $win_id mousemove 847 335 click 3
fi
sleep 1.0
win_id=$(xdotool search --name --onlyvisible "Select manifest.json file")
# echo $win_id
xdotool windowfocus --sync $win_id key ctrl+v sleep 0.5 key Return
# sleep 3
for winID in $(wmctrl -l | grep -v 'Conceptual Keyboard - Chromium' | grep ' - Chromium' | grep -Eo '^[^ ]+')
do
echo $winID
wmctrl -i -r $winID -b add,below
done
wmctrl -i -r $(wmctrl -l | grep "Conceptual Keyboard - Chromium" | grep -Eo '^[^ ]+') -b add,above
wmctrl -i -r $(wmctrl -l | grep " - Mozilla Firefox" | grep -Eo '^[^ ]+') -b add,below
