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
      return fileList
    },

    createSession: async (awscred, sessiondata) => {
      const status = await ipcRenderer.invoke('createSession', awscred, sessiondata)
      return status
    }
  }
)
