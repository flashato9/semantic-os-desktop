// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Channels } from '../main_renderer/types';

//creating a wrapper for ipcRenderer
const electronHandler = {
  ipcRenderer: { //here ipcRenderer is a string.
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args); //here ipcRenderer is the imported object.
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
// /The "Main World" is Electron’s term for the JavaScript execution environment where your React code lives. So, this method literally means: "Expose this thing to the React frontend world."
export type ElectronHandler = typeof electronHandler;
