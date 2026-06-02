import { useState, FormEvent, ChangeEvent } from 'react';
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

function CNet() {

  return (<div className="flex h-[97vh] w-full flex-col">
  {/* Prompt Messages */}
  <div
    className="flex-1 overflow-y-auto bg-slate-300 text-sm leading-6 text-slate-900 shadow-md dark:bg-slate-800 dark:text-slate-300 sm:text-base sm:leading-7"
  >
      {SAMPLE_MESSAGES.map((msg, index) => (
          <ChatMessage 
            key={index} // React needs this tracking key when looping
            sender={msg.sender}
            text={msg.text}
          />
        ))
        }    
  </div>
  <PromptSection/>
</div>
  );
}

export default function ChatView() {
  return (
  <CNet/>  
);
}
