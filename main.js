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
const bucket = "apptestbucket10";

const env = process.env.NODE_ENV || "development";

// Enable live reload for Electron too
require("electron-reload")(__dirname, {
  // Note that the path to electron may vary according to the main file
  electron: require(`${__dirname}/node_modules/electron`),
});

// async function clearCache () {
//   await session.defaultSession.clearCache();
//   await session.defaultSession.clearStorageData();
// }

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

  // Fetch meta data for archive component
  ipcMain.handle("getmetadata", async (event, arg) => {
    var params = {
      Bucket: bucket,
      Prefix: "user/" + arg + "/archivemeta/", // Form path to metadata folder
      MaxKeys: 1000000,
    };

    // Get list of metadata keys (i.e. each key is a path to a json file)
    const archivekeys = await s3
      .listObjectsV2(params)
      .promise()
      .then((data) => {
        var list = data.Contents.map(function (el) {
          return el.Key;
        });
        var listclean = list.filter((file) => file.includes("json")); // Removes the empty path key from the list
        return listclean;
      })
      .catch(function (err) {
        console.log(err);
      });

    // Download each json file in list and store in new array of objects
    var archive = [];
    var downloadparams = {
      Bucket: bucket,
      Key: "",
    };
    for (var i = 0; i <= archivekeys.length - 1; i++) {
      downloadparams.Key = archivekeys[i];
      var stream = await s3.getObject(downloadparams).promise();
      var json = stream.Body.toString("utf-8");
      archive.push(JSON.parse(json));
    }
    return archive;
  });

  // Download a dataset
  ipcMain.handle("getdata", async (event, arg) => {
    // Parse key string for sub-directories, then check if sub-directory exists on disk
    // Creat sub-dir if needed
    // Download file

    //var stream = s3.getObject({Bucket: 'apptestbucket10',Key: 'user/us-east-1:b843452a-276a-41be-87b8-2bd9013a54e0/test8-2020123-205936/file2.txt'}).createReadStream()
    //var f = fs.createWriteStream('/Users/joel/Desktop/file1.txt');
    //stream.pipe(f);
    return null;
  });

  // Handle restore of Glacier Deep Archive dataset, and handle status check on restore
  ipcMain.handle("restoredata", async (event, arg) => {
    // Get list of all objects in target dataset
    var listparams = {
      Bucket: bucket,
      Prefix: "user/" + arg.userid + "/" + arg.dataid,
      MaxKeys: 1000000,
    };

    // Get array with objects, and each object holds Key (i.e. file path) and Restore status (status is undefined if Restore has not started)
    var objectList = await s3.listObjectsV2(listparams).promise();
    var keylist = objectList.Contents.map(function (el) {
      return el.Key;
    });

    // Start restoration process if has not begun
    if (arg.status == "archived") {
      for (var i = 0; i < keylist.length; i++) {
        var restoreparams = {
          Bucket: bucket,
          Key: keylist[i],
          RestoreRequest: {
            Days: 7, // Duration of restored data
            GlacierJobParameters: {
              Tier: "Standard", // Sets the speed of recovery. "Bulk" is cheaper than "Standard"
            },
          },
        };
        await s3.restoreObject(restoreparams).promise(); // Start restoring the target key
      }
      await updateArchivemetaFile("restoring"); // Update status property of metadata JSON
    } else if (arg.status == "restoring") {
      var headerlist = []; // Get the restore status for each key in dataset
      var restorecomplete = true;
      var restorecount = 0;
      for (var i = 0; i < keylist.length; i++) {
        var headparams = {
          Bucket: bucket,
          Key: keylist[i],
        };
        var header = await s3.headObject(headparams).promise();
        headerlist.push({
          // Store each key and its restore status together
          Key: keylist[i],
          Restore: header.Restore,
        });

        // Example entry if key restore in progress: Restore: 'ongoing-request="true"',
        // Example entry if key restore complete: Restore: 'ongoing-request="false", expiry-date="Fri, 31 Dec 1999 00:00:00 GMT"',
        if (header.Restore.includes("true")) {
          // If any instance of "true" found in the header then restore is incomplete and break from loop
          restorecomplete = false;
          break;
        } else if (header.Restore.includes("false")) {
          restorecount = restorecount + 1; // Keep count of keys that have been restored so far
          //console.log(header.Restore.expiry-date);
        }
      }
      if (restorecomplete === true) {
        // If restore has finished then update "status" on dataset metadata
        //await updateArchivemetaFile("restored"); // Update status property of metadata JSON
        // need to return restorecomplete vs. total in keylist.length
        console.log(restorecount)
      }
    }

    // Function to download current metadata for dataset, update the "status" property, then upload the new metadata
    async function updateArchivemetaFile(newstatus) {
      //Download metadata for target dataset
      var downloadparams = {
        Bucket: bucket,
        Key: "user/" + arg.userid + "/archivemeta/" + arg.dataid + "-meta.json",
      };
      var stream = await s3.getObject(downloadparams).promise();
      var json = stream.Body.toString("utf-8");
      var metadata = JSON.parse(json);
      metadata.status = newstatus; // Update the meta status

      // Upload the new meta
      var newjson = JSON.stringify(metadata);
      const uploadparams = {
        Bucket: bucket,
        Key: "user/" + arg.userid + "/archivemeta/" + arg.dataid + "-meta.json",
        Body: newjson,
        StorageClass: "STANDARD", // Store in Standard storage for easy retrieval
      };
      await s3
        .upload(uploadparams)
        .promise()
        .then((data) => {
          return 1;
        })
        .catch((err) => {
          console.log(err, err.stack); // Error occurred
          return 0;
        });
    }
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
    // CODE FOR FILENAMES WITHOUT SUB-DIRECTORIES
    // const fileNames = await fsp.readdir(arg).then(files => {
    //   return files
    // }).catch(err => {
    //   console.log(err)
    // })
    // return fileNames

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

  // Transfer metadata (call from preload.js)
  ipcMain.handle("sendmetadata", async (event, arg) => {
    const metadata = JSON.stringify(arg);

    // MetaData stored in two places
    // First, store metadata in a archive location for populating Archive component
    const params1 = {
      Bucket: bucket,
      Key: "user/" + arg.userid + "/archivemeta/" + arg.dataid + "-meta.json",
      Body: metadata,
      StorageClass: "STANDARD", // Store in Standard storage for easy retrieval
    };

    var transferstatus1 = await s3
      .upload(params1)
      .promise()
      .then((data) => {
        return 1;
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return 0;
      });

    // Second, store metadata with data
    const params2 = {
      Bucket: bucket,
      Key:
        "user/" +
        arg.userid +
        "/" +
        arg.dataid +
        "/" +
        arg.dataid +
        "-meta.json",
      Body: metadata,
      StorageClass: arg.storage,
    };

    var transferstatus2 = await s3
      .upload(params2)
      .promise()
      .then((data) => {
        return 1;
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return 0;
      });
    return [transferstatus1, transferstatus2];
  });

  // Send data (call from preload.js)
  ipcMain.handle("senddata", async (event, arg) => {
    var file = arg.file;
    var targetfile = arg.path.concat("/", file); // Target file for transfer
    var filecontent = fs.readFileSync(targetfile); // Store file
    var keyname = "user/" + arg.userid + "/" + arg.dataid + "/" + file; // Object location inside bucket

    const params = {
      Bucket: bucket,
      Key: keyname,
      Body: filecontent,
      StorageClass: arg.storage,
    };

    var transferstatus = await s3
      .upload(params)
      .promise()
      .then((data) => {
        return 1;
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return 0;
      });
    return transferstatus;
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
