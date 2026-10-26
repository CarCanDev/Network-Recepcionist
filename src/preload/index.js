import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  scanNetwork: () => ipcRenderer.invoke('network:scan'),
  getDomains: () => ipcRenderer.invoke('db:get-domains'),
  addDomain: (domain) => ipcRenderer.invoke('db:add-domain', domain),
  deleteDomain: (id) => ipcRenderer.invoke('db:delete-domain', id)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
