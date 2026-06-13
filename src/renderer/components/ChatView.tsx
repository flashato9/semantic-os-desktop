import { useState, useEffect, useRef } from 'react';
import './ChatView.css';
import ChatMessage from './ChatMessage';
import PromptSection from './PromptSection';
import { MessageData, AIMessageData } from '../../main_renderer/classes';
import AgentOverlay from './MoreOptionsOverlay';
import { Channel, MethodName, Sender } from '../../main_renderer/enums';

interface ChatViewState {
  messages: MessageData[];
  isShowOverlay: boolean;
  isEnableChat: boolean;
}
async function getChatHistory(
  assistantId: string,
  threadId: string,
): Promise<MessageData[]> {
  console.log('getting chat history.');

  const result: MessageData[] = await window.electron?.ipcRenderer.invoke(
    MethodName.getChatHistory,
    { assistantId: assistantId, threadId: threadId },
  );
  return result;
}

function CNet() {
  const assistantId = '93f4c74d-b502-49b3-ac47-34f172a34886';
  const threadId = '019ea3c3-9f78-7181-9d7a-19a66dfa03d2';

  const [chatViewState, setChatViewState] = useState<ChatViewState>({
    messages: [],
    isShowOverlay: false,
    isEnableChat: true,
  });

  const toggleOverlay = () => {
    setChatViewState({
      ...chatViewState,
      isShowOverlay: !chatViewState.isShowOverlay,
    });
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
  }, [chatViewState]);

  const sendMessageToGraph = (message: MessageData) => {
    window.electron?.ipcRenderer.sendMessage(
      Channel.INCOMING_CHAT_MESSAGE,
      message,
    );
  };
  // 2. A central function to append new messages to our list
  const handleMessageSend = (newMessage: MessageData) => {
     const pendingMessage = new AIMessageData(
      '...PENDING RESPONSE',
      newMessage.id,
    );
    setChatViewState((oldState) => {
      return {
        ...oldState,
        messages: [...oldState.messages, newMessage, pendingMessage],
        isEnableChat: false,
      };
    });
    sendMessageToGraph(newMessage);
  };
  const handleMessageReceived = (newMessage: AIMessageData) => {
    setChatViewState((oldState) => {
      const oldMessagesFiltered = oldState.messages.filter(
        (elem) => elem.message != '...PENDING RESPONSE',
      );
      return {
        ...oldState,
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
    setChatViewState((oldState) => {
      return {
        ...oldState,
        messages: [...messages],
      };
    });
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
  useEffect(() => {
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

    getChatHistoryAndUpdateUI(assistantId, threadId);
  }, []);

  return (
    <div className="chat-view-container">
      {chatViewState.isShowOverlay && (
        <div className="chat-overlay-anchor">
          <AgentOverlay />
        </div>
      )}

      <div className="chat-scroller-viewport">
        {chatViewState.messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <PromptSection
        onSendMessage={handleMessageSend}
        onToggleOverlay={toggleOverlay}
        isEnabled={chatViewState.isEnableChat}
      />
    </div>
  );
}

export default function ChatView() {
  return <CNet />;
}
