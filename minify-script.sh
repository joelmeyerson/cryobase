#!/bin/bash

# Requires Babel minify tool to be installed globally:
# sudo npm install @babel/core @babel/cli babel-minify -g 

# Create minified versions of main.js and preload.js
minify ./public/main.js --mangle true --outFile ./public/main.min.js
minify ./public/preload.js --mangle true --outFile ./public/preload.min.js

# Rename original main.js and preload.js files and move to main app directory.
mv ./public/main.js ./main.max.js
mv ./preload/main.js ./preload.max.js

# Rename minified versions to main.js and preload.js
mv ./public/main.min.js ./public/main.js
mv ./public/preload.min.js ./public/preload.js
