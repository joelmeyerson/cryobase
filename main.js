// Modules to control application life and create native browser window
const { app, session, BrowserWindow, dialog } = require("electron");
const os = require("os");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

const electron = require("electron");
const { ipcMain } = require("electron");
const AWS = require("aws-sdk");
const fse = require("fs-extra");
const appName = app.getName();

const s3 = new AWS.S3();
var bucket = "";

const env = process.env.NODE_ENV || "development";

// Enable live reload for Electron too
require("electron-reload")(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`),
});

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Handle path selection through file browser (call from preload.js)
  ipcMain.handle("configureaws", async (event, arg) => {
    bucket = arg.bucket;
    AWS.config.accessKeyId = arg.accessKey;
    AWS.config.secretAccessKey = arg.secretKey;
    var params = {
      Bucket: bucket,
      MaxKeys: 1,
    };
    const validateconfig = await listKeys(params);
    return validateconfig;
  });

  // Handle path selection through file browser (call from preload.js)
  ipcMain.handle("selectdirectory", async (event, arg) => {
    const path = await dialog
      .showOpenDialog(mainWindow, { properties: ["openDirectory"] })
      .then((result) => {
        return result.filePaths;
      })
      .catch((err) => {
        console.log(err);
      });
    return path;
  });

  // Handle local data path listing (call from preload.js)
  ipcMain.handle("listdirectory", async (event, arg) => {
    // Get file names in main dir, and sub-directories with files
    var files = [];
    function throughDirectory(dir) {
      fs.readdirSync(dir).forEach((file) => {
        const absolute = path.join(dir, file);
        if (fs.statSync(absolute).isDirectory())
          return throughDirectory(absolute);
        else return files.push(absolute);
      });
    }
    throughDirectory(arg); // Call function
    var fileNames = [];
    files.forEach((file) => {
      fileNames.push(file.replace(arg + "/", "")); // Remove base directory name from each path
    });
    return fileNames;
  });

  // Upload data (call from preload.js)
  ipcMain.handle("senddata", async (event, arg) => {
    var file = arg.file;
    var targetfile = arg.path.concat("/", file); // Target file for transfer
    var filecontent = fs.readFileSync(targetfile); // Store file
    var keyname = arg.dataid + "/" + file; // Object location inside bucket
    const params = {
      Bucket: bucket,
      Key: keyname,
      Body: filecontent,
      StorageClass: arg.storage,
    };
    var status = await s3
      .upload(params)
      .promise()
      .then((data) => {
        return "File upload successful.";
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return "File upload error.";
      });
    return status;
  });

  // Upload metadata (call from preload.js)
  ipcMain.handle("sendmetadata", async (event, arg) => {
    const metadata = JSON.stringify(arg);
    const params = {
      Bucket: bucket,
      Key: "meta/" + arg.dataid + ".json",
      Body: metadata,
      StorageClass: "STANDARD", // Store in Standard storage for easy retrieval
    };
    var status = await s3
      .upload(params)
      .promise()
      .then((data) => {
        return "Metadata upload successful.";
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return "Metadata upload error.";
      });
    return status;
  });

  // Fetch meta data
  ipcMain.handle("getmetadata", async (event, arg) => {
    var params = {
      Bucket: bucket,
      Prefix: "meta/", // Form path to metadata folder
      MaxKeys: 1000000,
    };

    // Get list of metadata keys (i.e. each key is a path to a json file)
    const metalist = await listKeys(params);
    var archive = [];
    var downloadparams = {
      Bucket: bucket,
      Key: "",
    };
    for (var i = 0; i <= metalist.length - 1; i++) {
      // Download each json file in list and store in new array of objects
      downloadparams.Key = metalist[i];
      var stream = await s3.getObject(downloadparams).promise();
      var json = stream.Body.toString("utf-8");
      archive.push(JSON.parse(json));
    }
    return archive;
  });

  // Function to list keys from input params (called locally)
  async function listKeys(params) {
    const list = await s3
      .listObjectsV2(params)
      .promise()
      .then((data) => {
        var keys = data.Contents.map(function (el) {
          return el.Key;
        });
        return keys;
      })
      .catch(function (err) {
        return "error";
      });
    return list;
  }

  // List all keys matching input base key string (callable from renderer processes)
  ipcMain.handle("listkeys", async (event, arg) => {
    var listparams = {
      Bucket: bucket,
      Prefix: arg.dataid,
      MaxKeys: 1000000,
    };
    var objectList = await s3.listObjectsV2(listparams).promise();
    var keylist = [];
    objectList.Contents.forEach((item, i) => {
      keylist.push(item.Key);
    });
    return keylist;
  });

  // Function to update a key/val pair in metadata
  async function updateMeta(dataid, key, val) {
    var downloadparams = {
      Bucket: bucket,
      Key: "meta/" + dataid + ".json",
    };
    var stream = await s3.getObject(downloadparams).promise(); //Download metadata for target dataset
    var json = stream.Body.toString("utf-8");
    var metadata = JSON.parse(json);
    metadata[key] = val; // Update key with val
    var newjson = JSON.stringify(metadata); // Upload the new meta
    const uploadparams = {
      Bucket: bucket,
      Key: "meta/" + dataid + ".json",
      Body: newjson,
      StorageClass: "STANDARD", // Store in Standard storage for easy retrieval
    };
    const status = await s3
      .upload(uploadparams)
      .promise()
      .then((data) => {
        return (
          "Metadata for key " +
          key +
          " updated to value " +
          val +
          " successfully."
        );
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return "Metadata for " + key + " not updated successfully.";
      });
    console.log(status);
    return status;
  }

  // Update key/value pair in metadata (callable from renderer processes)
  ipcMain.handle("updatemeta", async (event, arg) => {
    var downloadparams = {
      Bucket: bucket,
      Key: "meta/" + arg.dataid + ".json",
    };
    var stream = await s3.getObject(downloadparams).promise(); //Download metadata for target dataset
    var json = stream.Body.toString("utf-8");
    var metadata = JSON.parse(json);
    metadata[arg.key] = arg.val; // Update key with val

    var newjson = JSON.stringify(metadata); // Upload the new meta
    const uploadparams = {
      Bucket: bucket,
      Key: "meta/" + arg.dataid + ".json",
      Body: newjson,
      StorageClass: "STANDARD", // Store in Standard storage for easy retrieval
    };
    const status = await s3
      .upload(uploadparams)
      .promise()
      .then((data) => {
        return (
          "Metadata for key " +
          arg.key +
          " updated to value " +
          arg.val +
          " successfully."
        );
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return "Metadata for " + arg.key + " not updated successfully.";
      });
    console.log(status);
    return status;
  });

  // Handle restore of Glacier Deep Archive dataset, and handle status check on restore
  ipcMain.handle("restoredata", async (event, arg) => {
    // Function return. Stores a notification to display to user.
    var returnstatus = {
      status: arg.status, // Return original status, or an updated status if needed
      statusnotification: "",
    };

    // Get list of all objects in target dataset
    var listparams = {
      Bucket: bucket,
      Prefix: arg.dataid,
      MaxKeys: 1000000,
    };
    const objectlist = await listKeys(listparams);
    switch (arg.status) {
      case "archived":
        for (var i = 0; i < objectlist.length; i++) {
          var restoreparams = {
            Bucket: bucket,
            Key: objectlist[i],
            RestoreRequest: {
              Days: 3, // Duration of restored data
              GlacierJobParameters: {
                Tier: "Standard", // Sets the speed of recovery. "Bulk" is cheaper than "Standard"
              },
            },
          };
          await s3.restoreObject(restoreparams).promise(); // Start restoring the target key
        }
        await updateMeta(arg.dataid, "status", "restoring");
        returnstatus.status = "restoring";
        returnstatus.statusnotification =
          "Data is now being restored for download.";
        break;

      case "restoring":
        var headerlist = []; // Get the restore status for each key in dataset
        var restorecomplete = true;
        var restorecount = 0;
        for (var i = 0; i < objectlist.length; i++) {
          var headparams = {
            Bucket: bucket,
            Key: objectlist[i],
          };
          var header = await s3.headObject(headparams).promise();
          headerlist.push({
            Key: objectlist[i], // Key string
            Restore: header.Restore, // Restore status
          });

          // Example entry if key restore in progress: Restore: 'ongoing-request="true"',
          // Example entry if key restore complete: Restore: 'ongoing-request="false", expiry-date="Fri, 31 Dec 1999 00:00:00 GMT"',
          if (header.Restore.includes("true")) {
            restorecomplete = false;
            break; // If any instance of "true" found in the header then restore is incomplete and break from loop
          } else if (header.Restore.includes("false")) {
            restorecount = restorecount + 1; // Keep count of keys that have been restored so far
          }
        }
        if (restorecomplete === true) {
          // If entire dataset is restored
          await updateMeta(arg.dataid, "status", "restored"); // Update status property of metadata JSON
          returnstatus.status = "restored";
          returnstatus.statusnotification =
            "Data has been restored and is available for download.";
        } else if (restorecomplete === false) {
          returnstatus.statusnotification =
            "Data restoration is still in progress. Restoration will complete about 12 hours after the job was started.";
        }
        break;
      case "restored": // Fall through to next case
      case "archiving":
        var headerlist = []; // Get the restore status for each key in dataset
        var restoreintact = true;
        var intactcount = 0;
        for (var i = 0; i < objectlist.length; i++) {
          var headparams = {
            Bucket: bucket,
            Key: objectlist[i],
          };
          var header = await s3.headObject(headparams).promise();
          headerlist.push({
            Key: objectlist[i], // Key string
            Restore: header.Restore, // Restore status
          });
          // Example entry if key restore complete: Restore: 'ongoing-request="false", expiry-date="Fri, 31 Dec 1999 00:00:00 GMT"',
          // Example entry if key sent back to archive: "undefined"
          if (typeof header.Restore === "undefined") {
            // If any instance of "undefined" found in the header then data is all or partially back in archive
            restoreintact = false;
          } else if (header.Restore.includes("false")) {
            intactcount = intactcount + 1; // Keep count of keys that remain intact
          }
        }
        if (restoreintact === true) {
          // If restore is intact then just report back expiry date
          var lastkeyheader = headerlist[headerlist.length - 1].Restore; // Gives the header for the final key in the list sent for restoration.
          var expiretime = lastkeyheader.split(",")[2].replace('"', ""); // Split the string to get just the date/time stamp, and remove the final character
          returnstatus.statusnotification =
            "Restored data is currently available for download. Data will return to Archived status on or around " +
            expiretime +
            ".";
        } else if (restoreintact === false && intactcount === 0) {
          // If restore is entirely unavailable then switch data back to "archived" status on dataset metadata
          await updateMeta(arg.dataid, "status", "archived"); // Update status property of metadata JSON
          returnstatus.status = "archived";
          returnstatus.statusnotification =
            "Data has returned to Archived status.";
        } else if (restoreintact === false && intactcount > 0) {
          await updateMeta(arg.dataid, "status", "archiving"); // Update status property of metadata JSON
          returnstatus.status = "archiving";
          returnstatus.statusnotification =
            "Data is in the process of returning to Archived status. When this process completes data can be restored again.";
        }
        break;
      default:
        console.log(
          "There was an error and data status does not match any case in switch."
        );
        break;
    }
    return returnstatus; // For displaying notification
  });

  // Download a dataset
  ipcMain.handle("getdata", async (event, arg) => {
    var splitkey = arg.key.split("/");
    var filename = splitkey[splitkey.length - 1];

    // Check for sub-directories in key
    var startpos = 3; // Start after "user" and "userid" and "dataid"
    var endpos = splitkey.length - 1; // End on last element in array
    var path = "";

    for (var i = startpos; i <= endpos; i++) {
      var pathelement = splitkey[i];
      //console.log(pathelement);
      if (pathelement === filename) {
        break;
      } else if (!fs.existsSync(arg.downloadpath + "/" + path + pathelement)) {
        //console.log("dir created");
        //console.log(arg.downloadpath + path + pathelement)
        fs.mkdirSync(arg.downloadpath + "/" + path + pathelement);
        path = path + pathelement + "/";
        //console.log(path);
      } else {
        path = path + pathelement + "/";
        //console.log(path);
      }
    }

    var stream = await s3
      .getObject({
        Bucket: bucket,
        Key: arg.key,
      })
      .createReadStream();

    var writestream = await fs.createWriteStream(
      arg.downloadpath + "/" + path + filename
    ); // Create writestream
    stream.pipe(writestream); // Write the file to stream
    return null;
  });

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')
  mainWindow.loadURL("http://localhost:3000/");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  //clearCache()
  createWindow();

  session.loadExtension(
    path.join(
      os.homedir(),
      "/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0"
    )
  );

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
