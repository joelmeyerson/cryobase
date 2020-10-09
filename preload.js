const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld(
  'electron',
  {
    sendOpenDialog: async () => {
      const path = await ipcRenderer.invoke('selectDirectory','true')
      return path
    }
  }
)
