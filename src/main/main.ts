/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {MessageData, SystemMessageData} from "../main_renderer/classes"

class AppUpdater {
  constructor() { //this is how you create a constructor in TypeScript
    log.transports.file.level = 'info'; //I guess electron-log is a logger for electron apps. Here its saying set the log level to info
    //electron-log is very special because when the user is running your app in prod, this logger will log errors and if the user has an issue the can export this log and you can analyze it
    autoUpdater.logger = log; //you can set a logger for the autoUpdater. Here its setting it to log. 
    //Rememeber the autoUpdater. This is the module that allows your prod app to check for new updates, people download it and install. When this module runs its writes some logs, here we are asking those logs to be pipes to this same logger
    autoUpdater.checkForUpdatesAndNotify(); //it seems this is for updates. Here its just saying, when this AppUpdater object is created, first set the logger level, attach yourself to the logger and check for updates.
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('incoming-chat-messages', async (event, ...args) => {

  const user_message: MessageData = new MessageData(args[0].sender,args[0].message,args[0].id)
  console.log(`A message was received from render process. The message contains - ${JSON.stringify(user_message)}`)
  console.log("Sending the message to the agent for processing...")
  // TODO send message to langgraph
  console.log("The message has been sent to the agent.")
  event.reply('incoming-chat-messages', `The main process has recieved and processed messageid - ${user_message.id}.`);
  //TODO get response from langgraph
  const ai_message:SystemMessageData = new SystemMessageData("some radnodm system message",user_message.id)
  console.log(`Repsonse message from langgraph - ${ai_message}`)
  event.reply('incoming-chat-messages',`The response message has been received from langgraph for messageid - ${user_message.id}.`)
  mainWindow?.webContents.send("ai-chat-messages", ai_message)
});

//Here we are defining an interface on the ipcMain. This means the front end can call this method ipc-example (i.e., via the preloader), and it will run the anonymous function here.
//when this anon funciton urns, it will reply to the enet with "IPC test: pong" and log the user's event to the terminal. 
// Its interesting because sometimes the front end can call ipc-example(helloworld) and they will always get "IPC test: pong" as the output and the real input will be logged in the console
//Why is the function async in this case?

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}
// process is a global variable in all node applicaitons.
// here we are saying if the enfironment is production, then install the source-map-support. What is this source-map-support?
//source-map-support is module that allows better logging for stack traces when the app is runningin production.
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'; //check if you're running in production or not.

if (isDebug) {
  require('electron-debug').default();
}
//if running in debug mode then import electron-debug

const installExtensions = async () => {
  const installer = require('electron-devtools-installer'); 
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS; //casting the value to a Boolean
  const extensions = ['REACT_DEVELOPER_TOOLS']; //these are chrome extensions that are insalled this way.

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log); //attached errors to the console.
};
//this method downloads extensions for react development if the mode is development.

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }//if debug mode, then install the extensions

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');
    //gets the resources for the app.

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => { //when the user wants to open a new window ti will direct it to the external browser.
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
