const { contextBridge, ipcRenderer } = require('electron')
const { fs } = require('fs')

contextBridge.exposeInMainWorld(
  'electron',
  {
    sendOpenDialog: async () => {
      const path = await ipcRenderer.invoke('selectDirectory','true')
      return path
    },

    listDirectory: async (path) => {
      const fileList = await ipcRenderer.invoke('listDirectory', path)
      //console.log(fileList)
      return fileList
    }
  }
)
