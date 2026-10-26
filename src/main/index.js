import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { exec } from 'child_process'
import fs from 'fs'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const dictPath = join(app.getPath('userData'), 'dictionary.json')

  if (!fs.existsSync(dictPath)) {
    fs.writeFileSync(dictPath, JSON.stringify([]), 'utf-8')
  }

  const getDictionary = () => {
    const data = fs.readFileSync(dictPath, 'utf-8')
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error(error)
      return []
    }
  }

  const saveDictionary = (data) => {
    fs.writeFileSync(dictPath, JSON.stringify(data, null, 2), 'utf-8')
  }

  ipcMain.handle('db:get-domains', () => {
    return getDictionary()
  })

  ipcMain.handle('db:add-domain', (event, domainName) => {
    const domains = getDictionary()

    if (domains.some((d) => d.domain === domainName)) {
      return { success: false, message: 'El dominio ya existe en la lista blanca' }
    }

    const newDomain = { id: Date.now(), domain: domainName }
    domains.push(newDomain)

    saveDictionary(domains)
    return { success: true, id: newDomain.id }
  })

  ipcMain.handle('db:delete-domain', (event, id) => {
    let domains = getDictionary()
    domains = domains.filter((d) => d.id !== id)
    saveDictionary(domains)
    return { success: true }
  })

  //Motor de escaneo ARP
  ipcMain.handle('network:scan', () => {
    return new Promise((resolve) => {
      exec('arp -a', (error, stdout) => {
        if (error) {
          resolve({ error: error.message })
          return
        }

        const devices = []
        const lines = stdout.split('\n')

        // Expresión regular para extraer IP y MAC en Windows
        const regex = /([0-9.]+)\s+([0-9a-f-]{17})\s+/i

        lines.forEach((line) => {
          const match = line.match(regex)

          if (match && !match[1].endsWith('.255') && match[1] !== '255.255.255.255') {
            devices.push({
              ip: match[1],
              mac: match[2].replace(/-/g, ':') // Formatear MAC a estándar con dos puntos
            })
          }
        })

        const uniqueDevices = [...new Map(devices.map((item) => [item.mac, item])).values()]

        resolve(uniqueDevices)
      })
    })
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
