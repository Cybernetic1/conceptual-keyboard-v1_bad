#!/bin/sh
beep
xdotool keyup Alt+g click --delay 150 1 key --delay 100 Down Return
xdotool sleep 2
xdotool key ctrl+Tab
xdotool sleep 1
xdotool key --delay 60 Tab Tab Tab End BackSpace BackSpace BackSpace g i f Return
