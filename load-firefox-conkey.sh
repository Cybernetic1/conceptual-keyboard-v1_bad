#!/bin/sh
beep
firefox about:debugging &
xdotool sleep 5
win_id=$(xdotool search Debugging)
xdotool windowfocus --sync $win_id
xdotool mousemove 894 263
xdotool click 3
xdotool sleep 3
xdotool key --delay 60 slash h o m e slash y k y slash m i s c minus p r o g r a m s slash c o n c e p t u a l minus k e y b o a r d slash f i r e f o x minus e x t e n s i o n Return
xdotool key Return tab m a n i f e s t Return
for winID in $(wmctrl -l | grep -v 'Conceptual Keyboard - Chromium' | grep ' - Chromium' | grep -Eo '^[^ ]+')
do
echo $winID
wmctrl -i -r $winID -b add,below
done
wmctrl -i -r $(wmctrl -l | grep "Conceptual Keyboard - Chromium" | grep -Eo '^[^ ]+') -b add,above
wmctrl -i -r $(wmctrl -l | grep " - Mozilla Firefox" | grep -Eo '^[^ ]+') -b add,below
