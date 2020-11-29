// Modules to control application life and create native browser window
const {app, session, BrowserWindow, dialog} = require('electron')
const os = require('os')
const path = require('path')
const fs = require('fs')
const fsp = require('fs').promises

const electron = require("electron")
const {ipcMain} = require('electron')
const AWS = require('aws-sdk');
const fse = require('fs-extra');
const appName = app.getName();

const s3 = new AWS.S3()
const env = process.env.NODE_ENV || 'development';

// Enable live reload for Electron too
require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/node_modules/electron`)
});

async function clearCache () {
  await session.defaultSession.clearCache();
  await session.defaultSession.clearStorageData();
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  })

  // Handle path selection through file browser (call from preload.js)
  ipcMain.handle('selectDirectory', async (event, arg) => {
    const path = await dialog.showOpenDialog(mainWindow,
      {properties: ['openDirectory']}
    ).then(result => {
      return result.filePaths
    }).catch(err => {
      console.log(err)
    })
    return path
  })

// Handle local data path listing (call from preload.js)
ipcMain.handle('listDirectory', async (event, arg) => {
  const fileNames = await fsp.readdir(arg).then(files => {
    return files
  }).catch(err => {
    console.log(err)
  })
  return fileNames
})

// Transfer data (call from preload.js)
ipcMain.handle('transferData', async (event, arg) => {
  const bucket = 'apptestbucket10'

  if (typeof(arg.dataset) !== 'undefined') { // If arg contains "dataset" property then must be metadata for upload
    const metadata = JSON.stringify(arg)
    var file = arg.dataid + "-meta.JSON"
    var filecontent = metadata
    console.log(filecontent)
  }
  else { // Otherwise request is for data transfer
    var file = arg.file
    var targetfile = arg.path.concat("/",file) // Target file for transfer
    var filecontent = fs.readFileSync(targetfile); // Store file
  }

  var keyname = "user/" + arg.userid + "/" + arg.dataid + "/" + file; // Object location inside bucket
  const params = {
    Bucket: bucket,
    Key: keyname,
    Body: filecontent
  };

  // Transfer file
  var transferstatus = await s3.upload(params).promise(
  ).then(data => {
    console.log(data);
    return 1
  }).catch(err => {
    console.log(err, err.stack); // Error occurred
    return 0
  })
  return transferstatus
});

  // and load the index.html of the app.
  //mainWindow.loadFile('index.html')
  mainWindow.loadURL('http://localhost:3000/')

  // Open the DevTools.
   mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  clearCache()
  createWindow()

  BrowserWindow.addDevToolsExtension(
     path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.8.2_0')
  )

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
