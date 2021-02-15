#!/bin/bash

# Requires Babel minify tool to be installed globally:
# sudo npm install @babel/core @babel/cli babel-minify -g

# Requires Terser tool to be installed globally:
# sudo npm install terser -g

echo "Running prebuild minify script."

# Create minified versions of electron.js and preload.js
#minify ./public/electron.js --mangle true --outFile ./public/min/electron.min.js
#minify ./public/preload.js --mangle true --outFile ./public/min/preload.min.js
terser ./public/electron.js -o ./min/electron.min.js -c -m
terser ./public/preload.js -o ./min/preload.min.js -c -m

# Rename original main.js and preload.js files and move to max sub-directory.
mv ./public/electron.js ./max/electron.js
mv ./public/preload.js ./max/preload.js

# Rename minified versions to main.js and preload.js
mv ./min/electron.min.js ./public/electron.js
mv ./min/preload.min.js ./public/preload.js

echo "Prebuild minify script complete."
