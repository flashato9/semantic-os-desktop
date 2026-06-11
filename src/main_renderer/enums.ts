export enum Channel {
    INCOMING_CHAT_MESSAGE = 'incoming-chat-messages',
    RECEIVED_CHAT_MESSAGE = 'received-chat-messages',
    AI_CHAT_MESSAGES = 'received-chat-messages'
} 

export enum MethodName{
    isLangGraphProcessRunning = "isLangGraphProcessRunning",
    initializeGraphProcess = "initializeGraphProcess",
    terminateGraphProcess = "terminateGraphProcess",
    getChatHistory = "getChatHistory"
}

export enum Sender{
    USER = "human",
    AI = "ai", //system for now but should be AI,
    TOOL = "tool",
    SYSTEM = "system"
}