import { BrowserWindow, shell } from 'electron';

export let browserWindows: Array<BrowserWindow | null> = [];
let splashScreen: BrowserWindow | null;

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const APP_WINDOW_WEBPACK_ENTRY: string;
declare const APP_WINDOW_PRELOAD_WEBPACK_ENTRY: string;
declare const SPLASH_WINDOW_WEBPACK_ENTRY: string;

// URLs from remote app loading
declare const REMOTE_PROD_URL: string;
declare const REMOTE_STAGING_URL: string;

// Determine if we are running in development mode
const isDev = process.argv.includes('--dev');

let mainIsReadyResolver: () => void;
const mainIsReadyPromise = new Promise<void>((resolve) => (mainIsReadyResolver = resolve));

export function mainIsReady() {
  mainIsReadyResolver();
}

export function getMainWindowOptions(): Electron.BrowserWindowConstructorOptions {
  return {
    height: 1024,
    width: 1024,
    show: false,
    /* title bar config for custom macos title bar
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : undefined,
    titleBarOverlay: process.platform === 'darwin',
    trafficLightPosition: {
      x: 8,
      y: 4,
    },
    */
    acceptFirstMouse: true,
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: APP_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  };
}

export function createMainWindow(): Electron.BrowserWindow {
  let mainWindow: BrowserWindow | null;
  mainWindow = new BrowserWindow(getMainWindowOptions());

  // and load the index.html of the app.
  if (isDev) {
    mainWindow.loadURL(APP_WINDOW_WEBPACK_ENTRY);
  } else if (process.argv.includes('--staging')) {
    mainWindow.loadURL(REMOTE_STAGING_URL);
  } else {
    mainWindow.loadURL(REMOTE_PROD_URL);
  }

  // Wait for the content to be fully loaded
  mainWindow.webContents.once('dom-ready', () => {
    if (splashScreen) {
      splashScreen.close();
    }
    mainWindow?.maximize();
    mainWindow?.show();
  });

  mainWindow.on('focus', () => {});

  mainWindow.on('closed', () => {
    browserWindows = browserWindows.filter((bw) => mainWindow !== bw);

    mainWindow = null;
  });

  // Open the DevTools.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Open external URLs in the default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Disable navigation from main page
  mainWindow.webContents.on('will-navigate', ({ url }) => {
    return { action: 'deny' };
  });

  // Disable navigation from main page
  mainWindow.webContents.on('did-start-navigation', ({ url }) => {
    return { action: 'deny' };
  });

  // Disable Reload (Ctrl+R) and Force Reload (Ctrl+Shift+R)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'keyDown' && (input.key === 'r' || input.key === 'R') && (input.control || input.meta)) {
      event.preventDefault();
    }
  });

  browserWindows.push(mainWindow);

  return mainWindow;
}

export function getSplashScreenOptions(): Electron.BrowserWindowConstructorOptions {
  return {
    width: 256,
    height: 256,
    frame: false,
    resizable: false,
    center: true,
    transparent: false,
    alwaysOnTop: true,
  };
}

export function createSplashScreen(): Electron.BrowserWindow {
  splashScreen = new BrowserWindow(getSplashScreenOptions());

  splashScreen.loadURL(SPLASH_WINDOW_WEBPACK_ENTRY);

  splashScreen.on('closed', () => {
    splashScreen = null;
  });

  return splashScreen;
}

export async function getOrCreateMainWindow(): Promise<Electron.BrowserWindow> {
  await mainIsReadyPromise;
  return browserWindows[0] || createMainWindow();
}
