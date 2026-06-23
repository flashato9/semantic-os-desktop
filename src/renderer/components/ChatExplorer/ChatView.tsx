import { useState, useEffect, useRef } from 'react';
import './ChatView.css';
import ChatMessage from './ChatMessage';
import PromptSection from './PromptSection';
import { MessageData, AIMessageData } from '../../../main_renderer/classes';
import AgentOverlay from './MoreOptionsOverlay';
import { Channel, Sender } from '../../../main_renderer/enums';
import { getChatHistory, initiateGraphProcess, isGraphProcessRunning } from '../../functions/functions_to_main_process';

interface ChatViewState {
  messages: MessageData[];
  isShowOverlay: boolean;
  isEnableChat: boolean;
  isChatInitialized:boolean;
}
function toggleOverlay(chatViewState:ChatViewState,setChatViewState:React.Dispatch<React.SetStateAction<ChatViewState>>){
  setChatViewState((prev) => ({
      ...prev,
      isShowOverlay: !chatViewState.isShowOverlay,
    }));
}
function scrollToBottom(reference: React.RefObject<HTMLDivElement | null>) {
    reference.current?.scrollIntoView({ behavior: 'smooth' });
  };

   function sendMessageToGraph (message: MessageData) {
    window.electron?.ipcRenderer.sendMessage(
      Channel.INCOMING_CHAT_MESSAGE,
      message,
    );
  };

function CNet() {
  const assistantId = '93f4c74d-b502-49b3-ac47-34f172a34886';
  const threadId = '019ea3c3-9f78-7181-9d7a-19a66dfa03d2';

  const [chatViewState, setChatViewState] = useState<ChatViewState>({
    messages: [],
    isShowOverlay: false,
    isEnableChat: true,
    isChatInitialized:false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom(messagesEndRef);
  }, [chatViewState]);

 
  // 2. A central function to append new messages to our list
  const handleMessageSend = (newMessage: MessageData) => {
     const pendingMessage = new AIMessageData(
      '...PENDING RESPONSE',
      newMessage.id,
    );
    setChatViewState((prev) =>({
        ...prev,
        messages: [...prev.messages, newMessage, pendingMessage],
        isEnableChat: false,
      }));
    sendMessageToGraph(newMessage);
  };
  const handleMessageReceived = (newMessage: AIMessageData) => {
    setChatViewState((prev) => {
      const oldMessagesFiltered = prev.messages.filter(
        (elem) => elem.message != '...PENDING RESPONSE',
      );
      return {
        ...prev,
        messages: [...oldMessagesFiltered, newMessage],
         isEnableChat: true,
      };
    });
  };
  const initializeMessages = (historyMessages: MessageData[]) => {
    const messages = historyMessages.filter((elem: MessageData) => {
      return (
        (elem.message && elem.sender == Sender.AI) || elem.sender == Sender.USER
      );
    });
    setChatViewState((prev) => ({
      ...prev,
      messages: [...messages],
    }));
  };
  const getChatHistoryAndUpdateUI = async (
    assistantId: string,
    threadId: string,
  ) => {
    const chatHistory: MessageData[] = await getChatHistory(
      assistantId,
      threadId,
    );
    initializeMessages(chatHistory);
  };
  const setupChat = async () => {
      window.electron?.ipcRenderer.on(
        Channel.INCOMING_CHAT_MESSAGE,
        (...result) => {
          console.log('Response from Main -->', result[0]);
        },
      );

      window.electron?.ipcRenderer.on(Channel.AI_CHAT_MESSAGES, (...args) => {
        const input = args[0] as AIMessageData;
        const result: AIMessageData = new AIMessageData(
          input.message,
          input.user_message_id,
          input.id,
        );
        console.log(`AI message has been received from Main -> ${result}`);
        handleMessageReceived(result);
      });
      const isGraphRunning = await isGraphProcessRunning();
      if(!isGraphRunning){
        await initiateGraphProcess();
      }
      await getChatHistoryAndUpdateUI(assistantId, threadId);
      const initialMessage = sessionStorage.getItem('initialMessage');
      if (initialMessage) {
        const message: MessageData = new MessageData('user', initialMessage);
        handleMessageSend(message);
        sessionStorage.removeItem('initialMessage');
      }
      setChatViewState((prev)=>({
        ...prev,
        isChatInitialized: true
      }))

      
    };
  useEffect(() => {
      setupChat();
  }, []);

  return (
    <div className="chat-view-container">
      {chatViewState.isShowOverlay && (
        <div className="chat-overlay-anchor">
          <AgentOverlay />
        </div>
      )}
      {!chatViewState.isChatInitialized &&
        <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Chat Messages...</p>
      </div>}
      <div className="chat-scroller-viewport">
        {chatViewState.messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <PromptSection
        onSendMessage={handleMessageSend}
        onToggleOverlay={() =>toggleOverlay(chatViewState,setChatViewState)}
        isEnabled={chatViewState.isEnableChat}
      />
    </div>
  );
}

export default function ChatView() {
  return <CNet />;
}
