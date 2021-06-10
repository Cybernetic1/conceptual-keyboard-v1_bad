pid=$(ps --no-headers -C 'python3 dreamland.py' |grep -v grep |awk '{print $1}')
echo "python3 =" $pid
kill $pid
pid=$(ps --no-headers -C 'geckodriver' |grep -v grep |awk '{print $1}')
echo "geckodriver =" $pid
kill $pid
