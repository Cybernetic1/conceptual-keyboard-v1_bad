#!/bin/sh
beep
firefox about:debugging &
xdotool sleep 4
win_id=$(xdotool search Debugging)
xdotool windowfocus --sync $win_id
xdotool mousemove 894 263
xdotool click 3
xdotool sleep 1
xdotool key --delay 40 slash h o m e slash y k y slash m i s c minus p r o g r a m s slash c o n c e p t u a l minus k e y b o a r d slash f i r e f o x minus e x t e n s i o n Return
xdotool key Return tab m a n i f e s t Return
chromes=$(wmctrl -l | grep -v 'Conceptual Keyboard - Chromium' | grep ' - Chromium' | grep -Eo '^[^ ]+')
for i in $chromes
do
    wmctrl -ir $i -b toggle,below
done
wmctrl -r 'Conceptual Keyboard' -b toggle,above
wmctrl -r 'Firefox' -b toggle,below
