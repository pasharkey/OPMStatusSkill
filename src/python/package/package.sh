#!/bin/bash

mkdir packaging
cp -r ../opmstatus.py ./packaging

# current workaround for homebrew bug
file=$HOME'/.pydistutils.cfg'
touch $file

/bin/cat <<EOM >$file
[install]
prefix=
EOM
# end of current workaround for homebrew bug

pip install -r ../requirements.txt -t ./packaging

cd packaging
zip -r -D OPMStatusSkill.zip *

# current workaround for homebrew bug
rm -rf $file
# end of current workaround for homebrew bug

mv OPMStatusSkill.zip ../
cd ..
rm -rf packaging


 
