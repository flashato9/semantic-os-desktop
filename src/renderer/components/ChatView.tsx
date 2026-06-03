import { useState, FormEvent, ChangeEvent, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './ChatView.css';
import ChatMessage from './ChatMessage';
import PromptSection from './PromptSection';

const SAMPLE_MESSAGES = [
  {
    sender: 'user' as const,
    text: 'Hello! I need a simple array structure for my messaging view.'
  },
  {
    sender: 'system' as const,
    text: 'Local AI agent connected. Ready to process text inputs.'
  },
  {
    sender: 'user' as const,
    text: 'Perfect. Let\'s keep it down to just the sender tag and the string text contents.'
  },
  {
    sender: 'system' as const,
    text: 'Data packet layout updated. Non-essential tracking values dropped.'
  },
    {
    sender: 'user' as const,
    text: 'Perfect. Let\'s keep it down to just the sender tag and the string text contents.'
  },
];

interface MessageData {
  sender: 'user' | 'system';
  text: string;
}

function CNet() {
  const [messages, setMessages] = useState<MessageData[]>([
    ...SAMPLE_MESSAGES
  ]);

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

  // 2. A central function to append new messages to our list
  const appendMessage = (text: string) => {
    const newMessage: MessageData = {
      sender: 'user',
      text: text
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };
  return (<div className="flex h-[97vh] w-full flex-col">
  {/* Prompt Messages */}
  <div
    className="flex-1 overflow-y-auto bg-slate-300 text-sm leading-6 text-slate-900 shadow-md dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7"
  >
      {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            sender={msg.sender} 
            text={msg.text} 
          />
        ))}  
        <div ref={messagesEndRef} />
  </div>
  <PromptSection onSendMessage={appendMessage}/>
</div>
  );
}

export default function ChatView() {
  return (
  <CNet/>  
);
}
