#!/bin/sh
beep -f 256 -l 30
# echo $@
if [ ${#1} = 1 ]
then
	xdotool mousemove 176 171
	xdotool click 3
fi
xdotool key $@
