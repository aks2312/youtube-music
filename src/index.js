"use strict";
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const { autoUpdater } = require("electron-updater");
const { is } = require("electron-util");
const { readFileSync } = require("fs");
const {
  ensureOnline,
  createTray,
  updateMediaControls
} = require("./helpers.js");
const config = require("./config");
const menu = require("./menu");

app.setAppUserModelId("com.botallen.youtubemusic");

// It's commented out as it throws an error if there are no published versions.
if (!is.development) {
  const FOUR_HOURS = 1000 * 60 * 60 * 4;
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, FOUR_HOURS);

  autoUpdater.checkForUpdates();
}

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
  const win = new BrowserWindow({
    title: app.name,
    show: false,
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    icon: config.get("icons.default"),
    webPreferences: {
      nodeIntegration: true,
      devTools: false
    }
  });

  win.on("ready-to-show", () => {
    win.show();
  });

  win.on("close", event => {
    // Dereference the window
    // For multiple windows store them in an array
    event.preventDefault();
    win.blur();
    if (is.macos) {
      // On macOS we're using `app.hide()` in order to focus the previous window correctly
      app.hide();
    } else {
      win.hide();
    }
  });

  await win.loadURL("https://music.youtube.com");

  return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

app.on("window-all-closed", () => {
  if (!is.macos) {
    app.quit();
  }
});

app.on("activate", async () => {
  if (!mainWindow) {
    mainWindow = await createMainWindow();
  }
});

(async () => {
  await Promise.all([ensureOnline(), app.whenReady()]);
  Menu.setApplicationMenu(menu);
  mainWindow = await createMainWindow();
  createTray(mainWindow);
  mainWindow.webContents.executeJavaScript(
    readFileSync(config.get("browser"), "utf8")
  );
})();

ipcMain.on("player-bar-status", (_, status) => {
  if (is.windows) {
    updateMediaControls(mainWindow, status);
  }
});
