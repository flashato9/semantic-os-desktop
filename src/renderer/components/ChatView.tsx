import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './ChatView.css';
import ChatMessage from './ChatMessage';
import PromptSection from './PromptSection';
import { MessageData, AIMessageData } from '../../main_renderer/classes';
import AgentOverlay from './MoreOptionsOverlay';
import { Channel, MethodName, Sender } from '../../main_renderer/enums';


async function getChatHistory(assistantId:string,threadId:string): Promise<MessageData[]>{
  console.log("getting chat history.")

  const result:MessageData[] = await window.electron?.ipcRenderer.invoke(MethodName.getChatHistory, {assistantId:assistantId,threadId:threadId});
  return result;
}

function CNet() {
  const assistantId = "93f4c74d-b502-49b3-ac47-34f172a34886";
  const threadId = "019ea3c3-9f78-7181-9d7a-19a66dfa03d2";
  const [messages, setMessages] = useState<MessageData[]>([]);

  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const toggleOverlay = () =>{
    setShowOverlay(!showOverlay);
  };
  

  // 1. Create a reference anchor point for the bottom of the chat
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 2. This function forces the page to scroll smoothly down to our anchor
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3. This effect automatically triggers EVERY time the `messages` array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageToGraph = (message:MessageData) => {
    window.electron?.ipcRenderer.sendMessage(Channel.INCOMING_CHAT_MESSAGE, message);
  }
  // 2. A central function to append new messages to our list
  const appendMessage = (newMessage: MessageData) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    if(newMessage.sender == 'user'){
      sendMessageToGraph(newMessage);
    }
    
  };
  const initializeMessages = (historyMessages: MessageData[]) => {
    const messages = historyMessages.filter((elem:MessageData)=> {
      return elem.message && elem.sender == Sender.AI || elem.sender == Sender.USER
    })
    setMessages((prevMessages) => [...messages]); 
  };
  const getChatHistoryAndUpdateUI = async (assistantId:string,threadId:string) => {
    const chatHistory:MessageData[] = await getChatHistory(assistantId,threadId);
    initializeMessages(chatHistory);
  };
  useEffect(()=>{
    window.electron?.ipcRenderer.on(Channel.INCOMING_CHAT_MESSAGE,(...result) => {
        console.log('Response from Main -->', result[0]);
      });

    window.electron?.ipcRenderer.on(Channel.AI_CHAT_MESSAGES,(...args) => {
      const input = args[0] as AIMessageData
      const result:AIMessageData = new AIMessageData(input.message,input.user_message_id,input.id) ;
      console.log(`AI message has been received from Main -> ${result}`)
      appendMessage(result);
    });

    getChatHistoryAndUpdateUI(assistantId,threadId)
  },[])
  
  
  

  return (<div className="chat-view-container">
    {showOverlay && (
      <div className="chat-overlay-anchor">
        <AgentOverlay />
      </div>
    )}
    
    <div className="chat-scroller-viewport">
      {messages.map((msg, index) => (
        <ChatMessage 
          key={index} 
          message={msg}
        />
      ))}  
      <div ref={messagesEndRef} />
    </div>

    <PromptSection onSendMessage={appendMessage} onToggleOverlay={toggleOverlay}/>
  </div>
  );
}

export default function ChatView() {
  return (
  <CNet/>  
);
}
