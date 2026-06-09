import { useState, FormEvent, ChangeEvent, JSX, KeyboardEvent, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './PromptSection.css';
import { MessageData } from '../../main_renderer/classes';

interface PromptSectionProps {
  onSendMessage: (newMessage: MessageData) => void;
  onToggleOverlay: () => void;
}

const MAX_SCROLL_HEIGHT: number = 100;

function CNet({ onSendMessage, onToggleOverlay}: PromptSectionProps) {

  const [inputValue, setInputValue] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInitAgent = async () => {
    onToggleOverlay(); 
  };
  
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height momentarily to force an accurate scrollHeight recalculation
    textarea.style.height = 'auto';

    // Calculate the new height (bound between a base of 42px and a max limit of 160px)
    const nextHeight = Math.min(textarea.scrollHeight, MAX_SCROLL_HEIGHT);
    
    // Apply the pixel calculation directly to the style attribute
    textarea.style.height = `${nextHeight}px`;
  }, [inputValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Block submission if it's empty space
    if (!inputValue.trim()) return;

    // 2. Trigger the parent function with the typed text payload!
    const message:MessageData = new MessageData("user",inputValue.trim());
    onSendMessage(message);

    // 3. Wipe the input box clean for the next prompt
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  let result: JSX.Element = (
    <form
    className="flex w-full items-center rounded-b-md border-t border-slate-300 bg-slate-200 p-2 dark:border-slate-700 dark:bg-slate-900"
    onSubmit={handleSubmit}
  >
    <label htmlFor="chat" className="sr-only">Please Enter your prompt</label>
    <div>
      <button
        className="hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2"
        type="button"
        onClick={handleInitAgent}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          aria-hidden="true"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M12 5l0 14"></path>
          <path d="M5 12l14 0"></path>
        </svg>
        <span className="sr-only">Add</span>
      </button>
    </div>
    <textarea
      ref={textareaRef}
      id="chat-input"
      rows={1}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className="resize-none no-scrollbar mx-2 flex min-h-full w-full rounded-md border border-slate-300 bg-slate-50 p-2 text-base text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:placeholder-slate-400 dark:focus:border-blue-600 dark:focus:ring-blue-600"
      placeholder="Please Enter your prompt"
    ></textarea>
    <div>
      <button
        className="inline-flex hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-600 sm:p-2"
        type="submit"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          aria-hidden="true"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
          <path d="M10 14l11 -11"></path>
          <path
            d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"
          ></path>
        </svg>
        <span className="sr-only">Send message</span>
      </button>
    </div>
  </form>
  );
 
  return result;
}

export default function PromptSection({ onSendMessage , onToggleOverlay}: PromptSectionProps) {
  return (
  <CNet onSendMessage={onSendMessage} onToggleOverlay={onToggleOverlay} />  
);
}
