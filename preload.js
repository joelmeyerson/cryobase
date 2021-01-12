const { contextBridge, ipcRenderer } = require("electron");
const { fs } = require("fs");

contextBridge.exposeInMainWorld("electron", {
  selectdirectory: async () => {
    const path = await ipcRenderer.invoke("selectdirectory", "true");
    return path;
  },

  listdirectory: async (path) => {
    const fileList = await ipcRenderer.invoke("listdirectory", path);
    return fileList;
  },

  senddata: async (sessiondata) => {
    const status = await ipcRenderer.invoke("senddata", sessiondata);
    return status;
  },

  getmetadata: async () => {
    const archivemeta = await ipcRenderer.invoke("getmetadata");
    return archivemeta;
  },

  getdata: async (selecteddata) => {
    const status = await ipcRenderer.invoke("getdata", selecteddata);
    return status;
  },

  restoredata: async (selecteddata) => {
    const restorestatus = await ipcRenderer.invoke("restoredata", selecteddata);
    return restorestatus;
  },

  sendmetadata: async (identityid) => {
    const status = await ipcRenderer.invoke("sendmetadata", identityid);
    return status;
  },

  listkeys: async (params) => {
    const keys = await ipcRenderer.invoke("listkeys", params);
    return keys;
  },

  updatemeta: async (params) => {
    const status = await ipcRenderer.invoke("updatemeta", params);
    return status;
  },

});
