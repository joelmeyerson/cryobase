const { contextBridge, ipcRenderer } = require('electron')
const { fs } = require('fs')

contextBridge.exposeInMainWorld(
  'electron',
  {
    selectdirectory: async () => {
      const path = await ipcRenderer.invoke('selectdirectory','true')
      return path
    },

    listdirectory: async (path) => {
      const fileList = await ipcRenderer.invoke('listdirectory', path)
      return fileList
    },

    getmetadata: async (identityid) => {
      const archivemeta = await ipcRenderer.invoke('getmetadata', identityid)
      return archivemeta
    },

    getdata: async (identityid) => {
      const status = await ipcRenderer.invoke('getdata', identityid)
      return status
    },

    restoredata: async (selecteddata) => {
      const restorestatus = await ipcRenderer.invoke('getmetadata', selecteddata)
      return restorestatus
    },

    sendmetadata: async (identityid) => {
      const status = await ipcRenderer.invoke('sendmetadata', identityid)
      return status
    },

    senddata: async (sessiondata) => {
      const status = await ipcRenderer.invoke('senddata', sessiondata)
      return status
    }
  }
)
