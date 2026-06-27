import React, { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import './Terminal.css';
import {
  spawnTerminal,
  writeTerminalInput,
  killTerminal,
  resizeTerminal,
} from '../../functions/functions_to_terminal';
import { Channel } from '../../../main_renderer/enums';
import log from 'loglevel';

export default function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const prevDimensionsRef = useRef<{ cols: number; rows: number } | null>(null);
  const [terminalId, setTerminalId] = useState<string | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    log.debug('Terminal component mounting');

    const xterm = new XTerm({
      theme: {
        background: '#2c1810',
        foreground: '#f5e6d3',
        cursor: '#d4af80',
      },
    });

    const fitAddon = new FitAddon();
    xterm.loadAddon(fitAddon);
    fitAddonRef.current = fitAddon;

    xterm.open(terminalRef.current);
    xtermRef.current = xterm;
    fitAddon.fit();
    xterm.focus();

    const handleWindowResize = () => {
      requestAnimationFrame(() => fitAddonRef.current?.fit());
    };
    window.addEventListener('resize', handleWindowResize);

    spawnTerminal().then((id) => {
      log.debug('Terminal spawned with ID:', id);
      setTerminalId(id);
    });

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      xterm.dispose();
    };
  }, []);

  useEffect(() => {
    if (!xtermRef.current || !terminalId || !terminalRef.current) return;

    log.debug('Setting up listeners for terminal:', terminalId);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddonRef.current?.fit();
        if (xtermRef.current) {
          const { cols, rows } = xtermRef.current;
          if (
            !prevDimensionsRef.current ||
            prevDimensionsRef.current.cols !== cols ||
            prevDimensionsRef.current.rows !== rows
          ) {
            // Only resync PTY if dimensions actually changed
            prevDimensionsRef.current = { cols, rows };
            resizeTerminal(terminalId, cols, rows);
          }
        }
      });
    });
    resizeObserver.observe(terminalRef.current);

    const handleTerminalOutput = (event: any) => {
      log.debug('TERMINAL_OUTPUT received:', event);
      if (event.terminalId === terminalId) {
        xtermRef.current?.write(event.data);
      }
    };

    const handleTerminalError = (event: any) => {
      log.debug('TERMINAL_ERROR received:', event);
      if (event.terminalId === terminalId) {
        xtermRef.current?.write(event.data);
      }
    };

    const handleTerminalClosed = (event: any) => {
      log.debug('TERMINAL_CLOSED received:', event);
      xtermRef.current?.write('\r\nTerminal closed.');
    };

    const unsubscribeOutput = window.electron?.ipcRenderer.on(
      Channel.TERMINAL_OUTPUT,
      handleTerminalOutput,
    );
    const unsubscribeError =window.electron?.ipcRenderer.on(
      Channel.TERMINAL_ERROR,
      handleTerminalError,
    );
   window.electron?.ipcRenderer.once(
      Channel.TERMINAL_CLOSED,
      handleTerminalClosed,
    );

    const handleData = (data: string) => {
      log.debug('Key pressed:', JSON.stringify(data));
      writeTerminalInput(terminalId, data);
    };

    xtermRef.current?.onData(handleData);

    // Handle right-click copy
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const selectedText = xtermRef.current?.getSelection();
      if (selectedText) {
        navigator.clipboard.writeText(selectedText);
      }
    };

    terminalRef.current?.addEventListener('contextmenu', handleContextMenu);

    return () => {
      resizeObserver.disconnect();
      terminalRef.current?.removeEventListener(
        'contextmenu',
        handleContextMenu,
      );
      unsubscribeOutput?.();
      unsubscribeError?.();
      if (terminalId) {
        killTerminal(terminalId);
        log.debug('Terminal killed with ID:', terminalId);
      }
        
    };
  }, [terminalId]);

  return <div ref={terminalRef} id="terminal" />;
}
