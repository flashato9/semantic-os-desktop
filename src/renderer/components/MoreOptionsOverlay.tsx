import React, { useEffect, useState } from 'react';
import './MoreOptionsOverlay.css';

enum AgentStatus{
    Connected = "Connected 🟢",
    Disconnected = "Disconnected 🔴",
    Connecting = "Connecting ⏳"
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
    await new Promise(f => setTimeout(f, 1000));
    return false;
}
async function initiateGraphProcess() {
    console.log("initiating graph process")
    await new Promise(f => setTimeout(f, 5000));
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
                status: AgentStatus.Connected
                }   
            )
        }
        if(!_isGraphProcessRunning){
            setAgentOverlayState({
                ...agentOverlayState,
                status: AgentStatus.Disconnected
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
            _isGraphProcessRunning = await isGraphProcessRunning()
        }
        if (_isGraphProcessRunning){
            console.log("graph process is running. Setting active flag to true")
            setAgentOverlayState({
                ...agentOverlayState,
                status: AgentStatus.Connected,
                connectAction: ConnectAction.Disconnect
            })
        }
        if(!_isGraphProcessRunning){
            console.log("graph process is not running after attempt to activate. Setting active flag to true")
            setAgentOverlayState({
                ...agentOverlayState,
                status: AgentStatus.Disconnected,
                connectAction: ConnectAction.Connect
            })
        }
        return;
    };
    useEffect(()=>{
        getGraphStatusAndUpdateUIState()
    },[])


   

    return (
    <div className="agent-status-card">
        <header className="agent-status-header">
            <h1>Agent Status</h1>
            <button type="button" onClick={activateLangGraph}
            disabled={agentOverlayState.status === AgentStatus.Connecting}
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




