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
  const assistantId = "93f4c74d-b502-49b3-ac47-34f172a34886";
  const threadId = "019ea3c3-9f78-7181-9d7a-19a66dfa03d2";
  const ai_message:SystemMessageData = await sendAndGetAgentResponse(user_message,assistantId,threadId);
  console.log("The message has been sent to the agent.")
  event.reply('incoming-chat-messages', `The main process has recieved and processed messageid - ${user_message.id}.`);
  //TODO get response from langgraph as stream
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

export async function sendAndGetAgentResponse(userMessage: MessageData,assistantId:string, threadId:String): Promise<SystemMessageData> {
  // 1. Dynamic Thread Configuration URL
  const url = `http://127.0.0.1:2024/threads/${threadId}/runs/wait`;

  try {
    // 2. Fire the native Node.js fetch call
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        input: {
          messages: [
            {
              // 🚀 Dynamic insertion: Mapping your frontend message fields into the network body
              content: userMessage.message, 
              type: 'human'
            }
          ]
        }
      })
    });

    // 3. Network status guard rail
    if (!response.ok) {
      throw new Error(`[LangGraph Error]: Server responded with a bad status code -> ${response.status}`);
    }

    // 4. Extract the raw JSON object layout
    const rawResponseBody = await response.json() as any;
    console.log("Raw Response back from LangGraph Server:", rawResponseBody);
    const graphMessages = rawResponseBody?.messages || [];
    const aiLastResponse = graphMessages[graphMessages.length - 1];

    const aiMessageText = aiLastResponse?.content[0]?.text || aiLastResponse?.content || "No agent response text found.";

    // 5. Build your pristine class instance, cross-referencing the original user message ID!
    const generatedAiClassInstance = new SystemMessageData(
      aiMessageText, 
      userMessage.id // Links the system response to the specific user chat bubble ID
    );
    return generatedAiClassInstance;

  } catch (error: any) {
    console.error("Critical failure during API invocation sequence:", error.message);
    
    // Fallback: Hand back an explicit system error message class so the UI doesn't hang forever
    return new SystemMessageData(
      `Failed to reach the AI engine: ${error.message}`, 
      userMessage.id
    );
  }
}

