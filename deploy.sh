#!/usr/bin/env sh

# abort on errors
set -e

# copy dist code into demo
cp -a dist/. demo/

# navigate into the build output directory
cd demo

# create commit
git init
git add -A
git commit -m 'deploy demo page'

# force push commit to gh-pages branch
git push -f git@github.com:jaames/zfont.git master:gh-pages

# navigate to last directory
cd -