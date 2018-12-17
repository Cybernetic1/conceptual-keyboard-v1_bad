#!/bin/sh
xclip -selection clipboard /home/yky/misc-programs/conceptual-keyboard/load-conkey.txt
beep
firefox about:debugging &
sleep 4
win_id=$(xdotool search --name --onlyvisible "Debugging with Firefox Developer Tools")
# echo $win_id
xdotool windowfocus --sync $win_id mousemove 894 225 click 3
sleep 1
win_id=$(xdotool search --name --onlyvisible "Select Manifest File")
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
