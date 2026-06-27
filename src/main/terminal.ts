import * as pty from 'node-pty';
import { BrowserWindow } from 'electron';
import { Channel } from '../main_renderer/enums';
import log from "electron-log";

interface PtyProcess {
  pid: number;
  write: (data: string) => void;
  kill: () => void;
  resize: (cols: number, rows: number) => void;
  on: (event: string, handler: (data?: any) => void) => void;
}

const activeTerminals = new Map<string, PtyProcess>();
let mainWindowRef: BrowserWindow | null = null;

export function spawnTerminal(mainWindow: BrowserWindow): string {
  mainWindowRef = mainWindow;
  const terminalId = Date.now().toString();

  log.debug(`Spawning PTY terminal ${terminalId}`);

  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME || process.env.USERPROFILE,
  }) as any;

  ptyProcess.on('data', (data: string) => {
    log.debug(`[${terminalId}] PTY data:`, JSON.stringify(data.substring(0, 100)));
    mainWindow.webContents.send(Channel.TERMINAL_OUTPUT, { terminalId, data });
  });

  ptyProcess.on('error', (err: Error) => {
    log.error(`[${terminalId}] PTY error:`, err);
  });

  ptyProcess.on('close', () => {
    log.debug(`[${terminalId}] PTY closed`);
    mainWindow.webContents.send(Channel.TERMINAL_CLOSED, { terminalId });
    activeTerminals.delete(terminalId);
  });

  activeTerminals.set(terminalId, ptyProcess);
  return terminalId;
}

export function writeTerminalInput(terminalId: string, input: string): void {
  log.debug(`[${terminalId}] writing to PTY:`, JSON.stringify(input));
  const ptyProcess = activeTerminals.get(terminalId);
  if (ptyProcess) {
    ptyProcess.write(input);
  } else {
    log.error(`[${terminalId}] ERROR: PTY process not found`);
  }
}

export function killTerminal(terminalId: string): void {
  const ptyProcess = activeTerminals.get(terminalId);
  if (ptyProcess) {
    ptyProcess.kill();
    activeTerminals.delete(terminalId);
  }
}
export function resizeTerminal(terminalId: string, cols: number, rows: number): void {
  log.debug(`[${terminalId}] Resize request: ${cols}x${rows}`);
  const ptyProcess = activeTerminals.get(terminalId);
  if (ptyProcess) {
    ptyProcess.resize(cols, rows);
  } else {
    log.error(`[${terminalId}] ERROR: PTY process not found for resize`);
  }
}

