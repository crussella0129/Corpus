import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { initializeSchema } from './db/schema'
import { closeDb } from './db/connection'
import { registerCardHandlers } from './ipc/cards.ipc'
import { registerReviewHandlers } from './ipc/review.ipc'
import { registerDashboardHandlers } from './ipc/dashboard.ipc'
import { registerSearchHandlers } from './ipc/search.ipc'
import { registerGraphHandlers } from './ipc/graph.ipc'
import { registerNavigationHandlers } from './ipc/navigation.ipc'
import { seedInitialData } from './seed'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.corpus')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize database and schema
  initializeSchema()
  seedInitialData()

  // Register all IPC handlers
  registerCardHandlers()
  registerReviewHandlers()
  registerDashboardHandlers()
  registerSearchHandlers()
  registerGraphHandlers()
  registerNavigationHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  closeDb()
})
