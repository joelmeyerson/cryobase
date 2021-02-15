#!/bin/bash

echo "Running postbuild script to restore un-minified electron.js and preload.js."

# Move un-minified electron.js and preload.js files back to public directory.
mv ./max/electron.js ./public/electron.js
mv ./max/preload.js ./public/preload.js

echo "Postbuild script complete."
