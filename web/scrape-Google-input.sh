#!/bin/sh

# get coordinates of Conkey browser window
conkey=$(printf "%d\n" $(wmctrl -l | grep 'Conceptual Keyboard - Chromium' | grep -Eo '0x[0-9a-f]+'))
eval $(xdotool getwindowgeometry --shell $conkey)
# results are in $X, $Y

