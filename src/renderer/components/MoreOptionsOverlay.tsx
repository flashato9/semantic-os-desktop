import React, { useEffect, useState } from 'react';
import './MoreOptionsOverlay.css';
import { MethodName } from '../../main_renderer/enums';

enum AgentStatus{
    Connected = "Connected 🟢",
    Disconnected = "Disconnected 🔴",
    Connecting = "Connecting ⏳",
    Disconnecting = "Disconnecting ⏳"
};
enum ConnectAction{
    Connect = "Connect 🟢",
    Disconnect = "Disconnect 🔴",
};
interface AgentOverlayState {
    status: AgentStatus,
    connectAction:ConnectAction
}
async function isGraphProcessRunning():Promise<Boolean> {
    console.log("checking if graph process is running.")
    const result:Boolean = await window.electron?.ipcRenderer.invoke(MethodName.isLangGraphProcessRunning, []);
    return result;
}
async function initiateGraphProcess() {
    console.log("initiating graph process")
    await window.electron?.ipcRenderer.invoke(MethodName.initializeGraphProcess, []);
    return;
}
async function terminateGraphProcess() {
    console.log("terminating graph process")
    await window.electron?.ipcRenderer.invoke(MethodName.terminateGraphProcess, []);
    return;
}


function CNet() {
    const defaultState = {
        status: AgentStatus.Disconnected,
        connectAction: ConnectAction.Connect
    }
    const [agentOverlayState, setAgentOverlayState] = useState<AgentOverlayState>(defaultState);


    const getGraphStatusAndUpdateUIState = async()=>{
        console.log("Checking and updating state")
        setAgentOverlayState({
            ...agentOverlayState,
            status: AgentStatus.Connecting
            }   
        )
        const _isGraphProcessRunning:Boolean = await isGraphProcessRunning()
        if(_isGraphProcessRunning){
            setAgentOverlayState({
                ...agentOverlayState,
                status: AgentStatus.Connected,
                connectAction: ConnectAction.Disconnect
                }   
            )
        }
        if(!_isGraphProcessRunning){
            setAgentOverlayState({
                ...agentOverlayState,
                status: AgentStatus.Disconnected,
                connectAction: ConnectAction.Connect
                }   
            )
        }
    }
    const activateLangGraph = async () =>{
        setAgentOverlayState({
            ...agentOverlayState,
            status: AgentStatus.Connecting
        })
        console.log("activating langgraph...")
        let _isGraphProcessRunning:Boolean = await isGraphProcessRunning()
        if (!_isGraphProcessRunning){
            await initiateGraphProcess()
        }
        await getGraphStatusAndUpdateUIState();
        return;
    };
     const deactivateLangGraph = async () =>{
        setAgentOverlayState({
            ...agentOverlayState,
            status: AgentStatus.Disconnecting
        })
        console.log("deactivating langgraph...")
        let _isGraphProcessRunning:Boolean = await isGraphProcessRunning()
        if (_isGraphProcessRunning){
            await terminateGraphProcess()
        }
        await getGraphStatusAndUpdateUIState();
        return;
    };
    useEffect(()=>{
        getGraphStatusAndUpdateUIState()
    },[])


   

    return (
    <div className="agent-status-card">
        <header className="agent-status-header">
            <h1>Agent Status</h1>
            <button type="button" onClick={agentOverlayState.status == AgentStatus.Connected ? deactivateLangGraph : activateLangGraph}
            disabled={agentOverlayState.status === AgentStatus.Connecting || agentOverlayState.status === AgentStatus.Disconnecting }
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
    return (
    <CNet/>  
);
}




