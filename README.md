# prototype

DESIGN
- Is Jobs tab a good way to manage active/queued uploads and downloads?

TODO
- Session Builder needs UI to browse system and select path to the image files for upload (NPM package for this? Wait to implement using Electron?).
- Session Builder needs code to write session metadata (Use fs.writeFile, HTML5 localStorage, other?).
- Session Builder needs code to upload session metadata to AWS.
- Session Builder needs code to create S3 bucket/vault and upload.
- Session Builder needs code to create an upload Job.
- Site needs routing for login page vs. main pages
- Site needs code to download JSON with user data archive metadata from AWS upon login.
- Archive viewer needs code to handle selection of dataset and download from AWS.
- Login needs to take user information and authenticate.
