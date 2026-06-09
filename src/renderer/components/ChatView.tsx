import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './ChatView.css';
import ChatMessage from './ChatMessage';
import PromptSection from './PromptSection';
import { MessageData, SystemMessageData } from '../../main_renderer/classes';
import AgentOverlay from './MoreOptionsOverlay';

const SAMPLE_MESSAGES = [
  new MessageData(
    'user',
    'Hello! I need a simple array structure for my messaging view.',
  ),
  new MessageData(
    'system',
    'Local AI agent connected. Ready to process text inputs.'
  ),
  new MessageData(
    'user',
    'Perfect. Let\'s keep it down to just the sender tag and the string text contents.'
  ),
  new MessageData(
    'system',
    'Data packet layout updated. Non-essential tracking values dropped.'
  ),
  new MessageData(
    'user',
    'Perfect. Let\'s keep it down to just the sender tag and the string text contents.'
  ),
];


function CNet() {
  const [messages, setMessages] = useState<MessageData[]>([
      ...SAMPLE_MESSAGES
    ]);

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
    window.electron?.ipcRenderer.sendMessage('incoming-chat-messages', message);
  }
  // 2. A central function to append new messages to our list
  const appendMessage = (newMessage: MessageData) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    if(newMessage.sender == 'user'){
      sendMessageToGraph(newMessage);
    }
    
  };
  useEffect(()=>{
    window.electron?.ipcRenderer.on("incoming-chat-messages",(...result) => {
        console.log('Response from Main -->', result[0]);
      });

    window.electron?.ipcRenderer.on("ai-chat-messages",(...args) => {
      const input = args[0] as SystemMessageData
      const result:SystemMessageData = new SystemMessageData(input.message,input.user_message_id,input.id) ;
      console.log(`AI message has been received from Main -> ${result}`)
      appendMessage(result);
    }); 
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
