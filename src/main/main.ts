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
import {MessageData, AIMessageData} from "../main_renderer/classes"
import { Channel, MethodName, Sender } from '../main_renderer/enums';
import { spawn,exec } from 'child_process';
import fs from 'fs';
import { spawnTerminal, writeTerminalInput, killTerminal, resizeTerminal } from './terminal';
import fsp from 'fs/promises';
import { promisify } from 'util';
import { FileNode } from "../main_renderer/interfaces";




class AppUpdater {
  constructor() { //this is how you create a constructor in TypeScript
    log.transports.file.level = 'info'; //I guess electron-log is a logger for electron apps. Here its saying set the log level to info
    log.transports.console.level= "info";
    //electron-log is very special because when the user is running your app in prod, this logger will log errors and if the user has an issue the can export this log and you can analyze it
    autoUpdater.logger = log; //you can set a logger for the autoUpdater. Here its setting it to log. 
    //Rememeber the autoUpdater. This is the module that allows your prod app to check for new updates, people download it and install. When this module runs its writes some logs, here we are asking those logs to be pipes to this same logger
    autoUpdater.checkForUpdatesAndNotify(); //it seems this is for updates. Here its just saying, when this AppUpdater object is created, first set the logger level, attach yourself to the logger and check for updates.
  }
}

let mainWindow: BrowserWindow | null = null;
const activeGraphProcesses = new Map<string, any>();
const execAsync = promisify(exec);

ipcMain.on(Channel.INCOMING_CHAT_MESSAGE, async (event, ...args) => {

  const user_message: MessageData = new MessageData(args[0].sender,args[0].message,args[0].id)
  console.log(`A message was received from render process. The message contains - ${JSON.stringify(user_message)}`)
  console.log("Sending the message to the agent for processing...")
  const assistantId = "93f4c74d-b502-49b3-ac47-34f172a34886";
  const threadId = "019ea3c3-9f78-7181-9d7a-19a66dfa03d2";
  const ai_message:AIMessageData = await sendAndGetAgentResponse(user_message,assistantId,threadId);
  console.log("The message has been sent to the agent.")
  event.reply(Channel.INCOMING_CHAT_MESSAGE, `The main process has recieved and processed messageid - ${user_message.id}.`);
  //TODO get response from langgraph as stream
  console.log(`Repsonse message from langgraph - ${ai_message}`)
  event.reply('incoming-chat-messages',`The response message has been received from langgraph for messageid - ${user_message.id}.`)
  mainWindow?.webContents.send(Channel.AI_CHAT_MESSAGES, ai_message)

});

ipcMain.handle(MethodName.isLangGraphProcessRunning, async(_, ...args) =>{
  console.log("Request Received from renderer: isLangGraphProcessRunning => Processing Request...")
    const result = await isGraphProcessRunning()
    return result;
})
ipcMain.handle(MethodName.initializeGraphProcess, async(_, ...args) =>{
  console.log("Request Received from renderer: initializeGraphProcess => Processing Request...")
    await initializeGraphProcess()
    
    return;
})
ipcMain.handle(MethodName.terminateGraphProcess, async(_, ...args) =>{
    console.log("Request Received from renderer: terminateGraphProcess => Processing Request...")
    await terminateGraphProcess(activeGraphProcesses)
    return;
})

ipcMain.handle(MethodName.getChatHistory, async(_, ...args) =>{
    console.log("Request Received from renderer: getChatHistory => Processing Request...")
    const {assistantId, threadId} = args[0];
    const result:MessageData[] = await getChatHistory(assistantId,threadId);
    return result;
})

ipcMain.handle(MethodName.getFileNode, async(_, ...args) =>{
    console.log("Request Received from renderer: getFileNode => Processing Request...")
    const filePath= args[0];
    const result:FileNode = await getFileNode(filePath);
    return result;
})

ipcMain.handle(MethodName.getFileNodeChildren, async(_, ...args) =>{
    console.log("Request Received from renderer: getFileNodeChildren => Processing Request...")
    const filePath = args[0];
    const result:FileNode[] = await getFileNodeChildren(filePath);
    return result;
})

ipcMain.handle(MethodName.getFileContent, async(_, ...args) =>{
    console.log("Request Received from renderer: getFileContent => Processing Request...")
    const filePath = args[0];
    const result:string = await getFileContent(filePath);
    return result;
})

ipcMain.handle(MethodName.spawnTerminal, async(_, ...args) =>{
    log.debug("IPC: spawnTerminal handler called");
    log.debug("mainWindow is:", mainWindow);
    const terminalId = spawnTerminal(mainWindow!);
    log.debug("IPC: spawnTerminal returning:", terminalId);
    return terminalId;
})

ipcMain.handle(MethodName.writeTerminalInput, async(_, ...args) =>{
    log.debug("IPC: writeTerminalInput handler called with args:", args);
    const { terminalId, input } = args[0];
    writeTerminalInput(terminalId, input);
    log.debug("IPC: writeTerminalInput complete");
})

ipcMain.handle(MethodName.killTerminal, async(_, ...args) =>{
    log.debug("IPC: killTerminal handler called");
    const terminalId = args[0];
    killTerminal(terminalId);
})

ipcMain.handle(MethodName.resizeTerminal, async(_, ...args) =>{
    log.debug("IPC: resizeTerminal handler called with args:", args);
    const terminalId = args[0];
    const cols = args[1];
    const rows = args[2];
    resizeTerminal(terminalId, cols, rows);
    log.debug("IPC: resizeTerminal complete");
})


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
  require('electron-debug').default({ showDevTools: false });
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

  // const menuBuilder = new MenuBuilder(mainWindow);
  // menuBuilder.buildMenu();
  mainWindow.setMenu(null);

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

async function sendAndGetAgentResponse(userMessage: MessageData,assistantId:string, threadId:String): Promise<AIMessageData> {
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
    // console.log("Raw Response back from LangGraph Server:", rawResponseBody);
    const graphMessages = rawResponseBody?.messages || [];
    const aiLastResponse = graphMessages[graphMessages.length - 1];

    const aiMessageText = aiLastResponse?.content[0]?.text || aiLastResponse?.content || "No agent response text found.";

    // 5. Build your pristine class instance, cross-referencing the original user message ID!
    const generatedAiClassInstance = new AIMessageData(
      aiMessageText, 
      userMessage.id // Links the system response to the specific user chat bubble ID
    );
    return generatedAiClassInstance;

  } catch (error: any) {
    console.error("Critical failure during API invocation sequence:", error.message);
    
    // Fallback: Hand back an explicit system error message class so the UI doesn't hang forever
    return new AIMessageData(
      `Failed to reach the AI engine: ${error.message}`, 
      userMessage.id
    );
  }
}
async function waitForGraphToStabilize(): Promise<boolean> {
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  let currentDelay = 1000;   // Start by waiting 1 second
  const maxDelay = 8000;     // Cap individual wait intervals at 8 seconds
  const maxDuration = 60000; // Hard limit: give up completely after 1 minute total
  const startTime = Date.now();

  while (Date.now() - startTime < maxDuration) {
    // Check if the server port responds
    const isOnline = await isGraphProcessRunning();

    if (isOnline) {
      console.log(`[Health Verification] ✅ LangGraph dev server is online! (Verified in ${((Date.now() - startTime) / 1000).toFixed(1)}s)`);
      return true;
    }

    console.log(`[Health Verification] Server not ready yet. Retrying in ${(currentDelay / 1000).toFixed(1)}s...`);
    await delay(currentDelay);
    
    // Grow the delay exponentially (1s -> 2s -> 4s -> 8s -> 8s...)
    currentDelay = Math.min(currentDelay * 2, maxDelay);
  }

  return false; // Timed out without a successful response
}

async function initializeGraphProcess() {
  try {
    console.log("Preparing LangGraph subprocess environment...");
    
    // 1. Setup your log file stream
    const logStream = fs.createWriteStream('./logs/graph-process.log', { flags: 'a' });
    
    // 2. Define your paths safely
    const targetDir = 'C:\\Users\\Ato_K\\Documents\\programming\\SemanticOS'; 
    const isWindows = process.platform === 'win32';
    
    // 3. Chain the commands together based on the operating system
    const commandSequence = isWindows
      ? `.\\.venv\\Scripts\\activate && langgraph dev`
      : `cd "${targetDir}" && source .venv/bin/activate && langgraph dev`;

    // 4. Spawn the system shell
    const shell = isWindows ? 'cmd.exe' : '/bin/bash';
    const shellArgs = isWindows ? ['/c', commandSequence] : ['-c', commandSequence];

    const child = spawn(shell, shellArgs, {
      cwd: targetDir,
      detached: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env } 
    });

    const pid = child.pid;

    // 5. Pipe the shell outputs right into your file log
    child.stdout.pipe(logStream);
    child.stderr.pipe(logStream);

    // 6. Register the running process instance to your global map tracker
    activeGraphProcesses.set(`graph-${pid}`, {
      process: child,
      startedAt: new Date()
    });

    console.log(`LangGraph background shell running under PID: ${pid}. Verifying port status...`);

    // 7. 🌟 CALL THE REFACTORED BACKOFF HELPER
    const stable = await waitForGraphToStabilize();

    if (!stable) {
      console.error(`[Initialization] ❌ LangGraph server failed to respond on port 2024 within 1 minute.`);
      
      // Automatic safety cleanup if it fails to stabilize
      await terminateGraphProcess(activeGraphProcesses);
      
      throw new Error("LangGraph service failed to start properly. Check your internal graph-process.log file.");
    }

    // Success! Return back to the Renderer process
    return { success: true, pid: pid };

  } catch (error: any) {
    console.error("Failed to execute LangGraph workflow shell:", error);
    throw new Error(`LangGraph Shell Launch Failed: ${error.message}`);
  }
}


async function findOrphanedGraphPID(): Promise<string | null> {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('netstat -aon | findstr :2024');
      
      if (!stdout || stdout.trim() === '') return null;

      // Split into lines and grab the first active connection line
      const lines = stdout.trim().split('\n');
      const parts = lines[0].trim().split(/\s+/);
      
      // The process ID is always the very last token on a netstat line
      const orphanPid = parts[parts.length - 1];
      
      return (orphanPid && orphanPid !== '0') ? orphanPid : null;
    }
    
    // Mac/Linux Fallback
    const { stdout } = await execAsync('lsof -t -i:2024');
    return stdout ? stdout.trim().split('\n')[0] : null;

  } catch (error) {
    // If netstat/findstr finds nothing, it throws an error. We catch it and return null.
    return null;
  }
}
async function terminateOrphanTree(pid: string): Promise<boolean> {
  if (!pid) return false;
  
  try {
    console.log(`[System Cleanup] Killing orphan process family tree under PID: ${pid}`);
    
    if (process.platform === 'win32') {
      // /F forces termination, /T kills the process and all child processes started by it
      await execAsync(`taskkill /F /T /PID ${pid}`);
    } else {
      // Mac/Linux tree kill alternative
      await execAsync(`kill -9 ${pid}`);
    }
    
    console.log(`[System Cleanup] Process tree for PID ${pid} successfully cleared.`);
    return true;
  } catch (error) {
    console.error(`[System Cleanup] Failed to kill process tree for PID ${pid}:`, error);
    return false;
  }
}


async function terminateGraphProcess(activeGraphProcesses?: Map<string, any>) {
  try {
    console.log("[Termination] Starting safe graph teardown sequence...");

    // 1. Scan the network stack for the PID holding port 2024
    const lingeringPid = await findOrphanedGraphPID();

    if (lingeringPid) {
      // 🛡️ CRITICAL SAFETY GUARD: Never allow critical Windows/System process IDs to be targeted
      const protectedPids = ['0', '4', '1', '2', '3']; 
      if (protectedPids.includes(lingeringPid.trim())) {
        console.warn(`[Termination Safe-Guard] Aborted execution. Targeted PID (${lingeringPid}) is an OS core process.`);
        return false;
      }

      // 2. Safely wipe out the process tree
      console.log(`[Termination] Found active instance under PID: ${lingeringPid}. Cleaving tree...`);
      await terminateOrphanTree(lingeringPid);
    } else {
      console.log("[Termination] Port 2024 is already completely open. No background process detected.");
    }

    // 3. Clean up the application's local Map memory registry if provided
    if (activeGraphProcesses && activeGraphProcesses.size > 0) {
      console.log("[Termination] Purging active process references from application memory...");
      
      // If you track the active process, make sure the root wrapper shell is also signaled to close
      const firstEntry = activeGraphProcesses.values().next().value;
      if (firstEntry?.process) {
        try {
          firstEntry.process.kill('SIGKILL');
        } catch {
          // Ignore if the shell process wrapper was already dead
        }
      }
      
      activeGraphProcesses.clear();
    }

    console.log("[Termination] ✅ Graph process and port 2024 cleared successfully.");
    return true;

  } catch (error: any) {
    console.error("[Termination] ❌ Fatal error occurred during the graph teardown sequence:", error.message);
    return false;
  }
}


export async function isGraphProcessRunning(): Promise<boolean> {
  // 1. Core health check target configuration
  const url = `http://127.0.0.1:2024/ok`;
  
  // Create an AbortController to enforce a strict timeout
  // This prevents the main process from hanging if the port is stuck in a half-open state
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5-second deadline

  try {
    console.log(`[Main Process] Probing LangGraph health endpoint: ${url}`);
    
    // 2. Fire a standard GET check request
    const response = await fetch(url, {
      method: 'GET', // LangGraph API responds with 'ok' to GET hooks
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    // Clear the safety timeout if the server responds fast
    clearTimeout(timeoutId);

    // 3. Evaluate health status
    if (response.ok) {
      console.log("[Main Process] ✅ LangGraph dev server responded successfully! It is active.");
      return true;
    }

    console.warn(`[Main Process] ⚠️ Server port responded, but returned status code: ${response.status}`);
    return false;

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    
    // Catch intentional timeout abort signals gracefully
    if (error.name === 'AbortError') {
      console.error("[Main Process] ❌ LangGraph health check timed out. Server is non-responsive.");
    } else {
      console.log("[Main Process] ❌ LangGraph server is completely offline (Connection refused).");
    }
    
    return false;
  }
}

async function extractChronologicalRawMessages(threadId: string): Promise<any[]> {
  const url = `http://127.0.0.1:2024/threads/${threadId}/history`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ limit: 100 })
  });

  if (!response.ok) {
    throw new Error(`LangGraph server history endpoint returned status -> ${response.status}`);
  }

  const historyTimeline = await response.json() as any[];
  if (!Array.isArray(historyTimeline)) {
    console.warn(`[Main Process] Expected history timeline array, but received:`, historyTimeline);
    return [];
  }

  const allMessagesMap = new Map<string, any>();

  // Process backwards (from oldest checkpoint to newest) to naturally order chronologically
  for (let i = historyTimeline.length - 1; i >= 0; i--) {
    const checkpointMessages = historyTimeline[i]?.values?.messages || [];
    for (const msg of checkpointMessages) {
      if (msg?.id && !allMessagesMap.has(msg.id)) {
        allMessagesMap.set(msg.id, msg);
      }
    }
  }

  return Array.from(allMessagesMap.values());
}

export async function getChatHistory(assistantId: string, threadId: string): Promise<MessageData[]> {
  try {
    console.log(`[Main Process] Requesting complete chronological thread history log for: ${threadId}`);
    
    // 1. Fetch data layer logs
    const rawMessages = await extractChronologicalRawMessages(threadId);

    // 2. Map raw messages over to standard frontend class representations
    const formattedMessages: MessageData[] = rawMessages.map((msg: any) => {
      let senderRole = Sender.AI;
      if (msg.type === 'human') senderRole = Sender.USER;
      if (msg.type === 'ai') senderRole = Sender.AI;
      if (msg.type === 'system') senderRole = Sender.SYSTEM;
      if (msg.type === 'tool') senderRole = Sender.TOOL;

      const extractedText = msg?.content[0]?.text ?? msg?.content ?? "No content found.";
      
      return new MessageData(senderRole, extractedText, msg?.id);
    });

    // 3. Link dependencies on the ordered dataset (convert AI roles to AIMessageData)
    for (let index = 0; index < formattedMessages.length; index++) {
      const msg = formattedMessages[index];
      
      if (msg.sender === Sender.AI) {
        const prevMsg = formattedMessages[index - 1];
        const prevId = prevMsg.id;
        
        formattedMessages[index] = new AIMessageData(
          msg.message, 
          prevId, 
          msg.id
        );
      }
    }

    console.log(`[Main Process] Chronologically compiled ${formattedMessages.length} deep historical bubbles.`);
    return formattedMessages;

  } catch (error: any) {
    console.error("[Main Process] Critical failure parsing chat logs:", error.message);
    return [];
  }
}

async function getFileNode(filePath: string): Promise<FileNode> {
  // 1. Get filesystem metadata stats from disk
  const stats = await fsp.stat(filePath);
  
  // 2. Extract the file/folder name and normalize the path separators
  const baseName = path.basename(filePath);
  const normalizedFullPath = filePath.replace(/\\/g, '/');

  // 3. Assemble and return the simplified object structure
  return {
    name: baseName,
    isFolder: stats.isDirectory(),
    fullPath: normalizedFullPath
  };
}
async function getFileNodeChildren(filePath: string): Promise<FileNode[]> {
  const itemNames = await fsp.readdir(filePath);

  const nodePromises = itemNames.map(async (itemName) => {
    const childAbsolutePath = path.join(filePath, itemName);
    return await getFileNode(childAbsolutePath);
  });

  return await Promise.all(nodePromises);
}

async function getFileContent(filePath: string): Promise<string> {
  try {
    return await fsp.readFile(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file at ${filePath}:`, error);
    throw error;
  }
}

