import { useState, FormEvent, ChangeEvent, JSX } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import humanAvatar from '../../../assets/chat/human.svg';
import aiAvatar from '../../../assets/chat/nn.svg';
import './ChatMessage.css';
import { MessageData } from '../../main_renderer/classes'; 
import { ThumbsUpIcon, ThumbsDownIcon, CopyMessageIcon } from '../../../assets/icons/ChatMessage';
import { Sender } from '../../main_renderer/enums';
interface ChatMessageProps {
  message: MessageData
}
function CNet({ message }: ChatMessageProps) {

  let result: JSX.Element = (
  <div className="chat-message-row user-message">
    <img
      className="chat-avatar"
      src={humanAvatar}
      alt="User Avatar"
    />
    <div className="chat-message-body">
      <p>{message.message}</p>
    </div>
  </div>
);

if (message.sender == Sender.AI) {
  result = (
    <div className="chat-message-row system-message">
      <img
        className="chat-avatar"
        src={aiAvatar}
        alt="AI Avatar"
      />
  
      <div className="chat-system-content-wrapper">
        <p className="chat-message-text-max">
          {message.message}
        </p>
        
        <div className="chat-action-buttons-group">
          {/* <button className="chat-icon-btn" type="button">
            <ThumbsUpIcon />
          </button>
          
          <button className="chat-icon-btn" type="button">
            <ThumbsDownIcon />
          </button> */}
          
          <button className="chat-icon-btn" type="button">
            <CopyMessageIcon/>
          </button>
        </div>
      </div>
    </div>
  );
}
  return result;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
  <CNet message = {message}/>  
);
}
