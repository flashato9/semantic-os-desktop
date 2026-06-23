import React, { useEffect, useState } from 'react';
import './MoreOptionsOverlay.css';
import {
  initiateGraphProcess,
  isGraphProcessRunning,
  terminateGraphProcess,
} from '../../functions/functions_to_main_process';
enum AgentStatus {
  Connected = 'Connected 🟢',
  Disconnected = 'Disconnected 🔴',
  Connecting = 'Connecting ⏳',
  Disconnecting = 'Disconnecting ⏳',
}
enum ConnectAction {
  Connect = 'Connect 🟢',
  Disconnect = 'Disconnect 🔴',
}
interface AgentOverlayState {
  status: AgentStatus;
  connectAction: ConnectAction;
}
async function getGraphStatusAndUpdateUIState(
  agentOverlayState: AgentOverlayState,
  setAgentOverlayState: React.Dispatch<React.SetStateAction<AgentOverlayState>>,
) {
  console.log('Checking and updating state');
  setAgentOverlayState({
    ...agentOverlayState,
    status: AgentStatus.Connecting,
  });
  const _isGraphProcessRunning: Boolean = await isGraphProcessRunning();
  if (_isGraphProcessRunning) {
    setAgentOverlayState({
      ...agentOverlayState,
      status: AgentStatus.Connected,
      connectAction: ConnectAction.Disconnect,
    });
  }
  if (!_isGraphProcessRunning) {
    setAgentOverlayState({
      ...agentOverlayState,
      status: AgentStatus.Disconnected,
      connectAction: ConnectAction.Connect,
    });
  }
}
async function activateLangGraph(
  agentOverlayState: AgentOverlayState,
  setAgentOverlayState: React.Dispatch<React.SetStateAction<AgentOverlayState>>,
) {
  setAgentOverlayState({
    ...agentOverlayState,
    status: AgentStatus.Connecting,
  });
  console.log('activating langgraph...');
  let _isGraphProcessRunning: Boolean = await isGraphProcessRunning();
  if (!_isGraphProcessRunning) {
    await initiateGraphProcess();
  }
  await getGraphStatusAndUpdateUIState(agentOverlayState, setAgentOverlayState);
  return;
}
async function deactivateLangGraph(
  agentOverlayState: AgentOverlayState,
  setAgentOverlayState: React.Dispatch<React.SetStateAction<AgentOverlayState>>,
) {
  setAgentOverlayState({
    ...agentOverlayState,
    status: AgentStatus.Disconnecting,
  });
  console.log('deactivating langgraph...');
  let _isGraphProcessRunning: Boolean = await isGraphProcessRunning();
  if (_isGraphProcessRunning) {
    await terminateGraphProcess();
  }
  await getGraphStatusAndUpdateUIState(agentOverlayState, setAgentOverlayState);
  return;
}
function CNet() {
  const defaultState = {
    status: AgentStatus.Disconnected,
    connectAction: ConnectAction.Connect,
  };
  const [agentOverlayState, setAgentOverlayState] =
    useState<AgentOverlayState>(defaultState);
  useEffect(() => {
    getGraphStatusAndUpdateUIState(agentOverlayState, setAgentOverlayState);
  }, []);

  return (
    <div className="agent-status-card">
      <header className="agent-status-header">
        <h1>Agent Status</h1>
        <button
          type="button"
          onClick={() =>
            agentOverlayState.status == AgentStatus.Connected
              ? deactivateLangGraph(agentOverlayState, setAgentOverlayState)
              : activateLangGraph(agentOverlayState, setAgentOverlayState)
          }
          disabled={
            agentOverlayState.status === AgentStatus.Connecting ||
            agentOverlayState.status === AgentStatus.Disconnecting
          }
        >
          {agentOverlayState.connectAction}
        </button>
      </header>
      <main className="agent-status-main">
        <ul>
          <li>
            Status: <b>{agentOverlayState.status}</b>
          </li>
        </ul>
      </main>
    </div>
  );
}

export default function AgentOverlay() {
  return <CNet />;
}
