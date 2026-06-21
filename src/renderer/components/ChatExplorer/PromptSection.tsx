import { useState, FormEvent, ChangeEvent, JSX, KeyboardEvent, useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../../../assets/icon.svg';
import './PromptSection.css';
import { MessageData } from '../../../main_renderer/classes';
import { SendIcon, MoreOptionsIcon } from "../../../../assets/icons/PromptSection";
interface PromptSectionProps {
  onSendMessage: (newMessage: MessageData) => void;
  onToggleOverlay: () => void;
  isEnabled: boolean
}
interface PromptSectionState{
  inputValue: string;
}

const MAX_SCROLL_HEIGHT: number = 100;

function CNet({ onSendMessage, onToggleOverlay, isEnabled}: PromptSectionProps) {

  const [promptSectionState, setPromptSectoinState] = useState<PromptSectionState>({
    inputValue:''
  });
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
  }, [promptSectionState]);

  const handleSubmit = (e: FormEvent) => {
    const inputValue = promptSectionState.inputValue
    e.preventDefault();

    // Block submission if it's empty space
    if (!inputValue.trim()) return;

    // 2. Trigger the parent function with the typed text payload!
    const message:MessageData = new MessageData("user",inputValue.trim());
    onSendMessage(message);

    // 3. Wipe the input box clean for the next prompt
    setPromptSectoinState({
      ...promptSectionState,
      inputValue:''
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  const setInputValue = (value:string) => {
    setPromptSectoinState({
      ...promptSectionState,
      inputValue:value
    });
  }

  let result: JSX.Element = (
    <form className="prompt-form-container" onSubmit={handleSubmit}>
    <label htmlFor="chat-input" className="sr-only">Please Enter your prompt</label>
    
    <div>
      <button
        className="prompt-action-btn"
        type="button"
        onClick={handleInitAgent}
      >
        <MoreOptionsIcon/>
        <span className="sr-only">More Options</span>
      </button>
    </div>

    <textarea
      ref={textareaRef}
      id="chat-input"
      rows={1}
      value={promptSectionState.inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      className="prompt-textarea-input"
      placeholder={!isEnabled? "Pending AI Response" :"Please Enter your prompt"}
      disabled={!isEnabled}
    ></textarea>

    <div>
      <button className="prompt-submit-btn" type="submit">
        <SendIcon/>
        <span className="sr-only">Send message</span>
      </button>
    </div>
  </form>
  );
 
  return result;
}

export default function PromptSection({ onSendMessage , onToggleOverlay,isEnabled}: PromptSectionProps) {
  return (
  <CNet onSendMessage={onSendMessage} onToggleOverlay={onToggleOverlay} isEnabled = {isEnabled} />  
);
}
