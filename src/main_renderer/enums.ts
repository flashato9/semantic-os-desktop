export enum Channel {
    INCOMING_CHAT_MESSAGE = 'incoming-chat-messages',
    RECEIVED_CHAT_MESSAGE = 'received-chat-messages',
    AI_CHAT_MESSAGES = 'received-chat-messages',
    TERMINAL_OUTPUT = 'terminal-output',
    TERMINAL_ERROR = 'terminal-error',
    TERMINAL_CLOSED = 'terminal-closed'
} 

export enum MethodName{
    isLangGraphProcessRunning = "isLangGraphProcessRunning",
    initializeGraphProcess = "initializeGraphProcess",
    terminateGraphProcess = "terminateGraphProcess",
    getChatHistory = "getChatHistory",
    getFileNodeChildren = "getFileNodeChildren",
    getFileNode = "getFileNode",
    getFileContent = "getFileContent",
    spawnTerminal = "spawnTerminal",
    writeTerminalInput = "writeTerminalInput",
    killTerminal = "killTerminal",
    resizeTerminal = "resizeTerminal"
}

export enum Sender{
    USER = "human",
    AI = "ai", //system for now but should be AI,
    TOOL = "tool",
    SYSTEM = "system"
}