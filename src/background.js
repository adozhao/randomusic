'use strict'

import { app, protocol, BrowserWindow, ipcMain, globalShortcut, Menu, Tray } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let mainWindow, appTray = null;

async function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    show: false,
    width: 500,
    height: 500,
    frame: false,
    useContentSize: true,
    maximizable: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      enableRemoteModule: true,
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) mainWindow.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL('app://./index.html')
  }

  mainWindow.on('ready-to-show', function(){
    setTimeout(()=>{
      mainWindow.show()
    }, 0)
  })

  globalShortcut.register("F12", () => {
      const win = BrowserWindow.getFocusedWindow()
      win.webContents.toggleDevTools()
      console.log('chrome version:' + process.versions.chrome)
  })

}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // try {
    //   await installExtension(VUEJS3_DEVTOOLS)
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }
  }
  createWindow()
})

ipcMain.on('window-close', function () {
  mainWindow.close()
})

ipcMain.on('tray-active', function(){
  mainWindow.hide()
  let trayMenuTemplate = [
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ];
  
  if(!appTray){
    appTray = process.env.NODE_ENV === 'development' ? new Tray('dist_electron/icons/tray.ico'): new Tray(`${__dirname}/images/tray.ico`);
  }
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  appTray.setToolTip('随心听');
  appTray.setContextMenu(contextMenu);
  appTray.on('click',function(){
    mainWindow.show();
  })
  appTray.on('right-click', () => {
    appTray.popUpContextMenu(trayMenuTemplate);
  });

})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
