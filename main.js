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
const bucket = "user-bucket-01";
//AWS.config.region = "us-east-1"; // Region
AWS.config.accessKeyId = "AKIAIM2TGVNNH6GREFUQ"
AWS.config.secretAccessKey = "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"
process.env.AWS_ACCESS_KEY_ID = "AKIAIM2TGVNNH6GREFUQ"
process.env.AWS_SECRET_ACCESS_KEY = "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"

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
    var transferstatus = await s3
      .upload(params)
      .promise()
      .then((data) => {
        return "Metadata upload successful.";
      })
      .catch((err) => {
        console.log(err, err.stack); // Error occurred
        return "Metadata upload error.";
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
