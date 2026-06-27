import { MethodName } from '../../main_renderer/enums';
import log from "loglevel";

export async function spawnTerminal(): Promise<string> {
  log.debug('spawnTerminal() called');
  const result = await window.electron?.ipcRenderer.invoke(MethodName.spawnTerminal);
  log.debug('spawnTerminal() returned:', result);
  return result;
}

export async function writeTerminalInput(terminalId: string, input: string): Promise<void> {
  log.debug('writeTerminalInput() called:', { terminalId, input });
  await window.electron?.ipcRenderer.invoke(MethodName.writeTerminalInput, { terminalId, input });
}

export async function killTerminal(terminalId: string): Promise<void> {
  log.debug('killTerminal() called with ID:', terminalId);
  const result = await window.electron?.ipcRenderer.invoke(MethodName.killTerminal, terminalId);
  log.debug('killTerminal() returned:', result);
  return result;
}
export async function resizeTerminal(terminalId: string, cols: number, rows: number): Promise<void> {
  log.debug('resizeTerminal() called:', { terminalId, cols, rows });
  const result = await window.electron?.ipcRenderer.invoke(MethodName.resizeTerminal, terminalId, cols, rows);
  log.debug('resizeTerminal() returned:', result);
  return result;
}
