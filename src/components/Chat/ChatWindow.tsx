import React, { useEffect, useRef } from 'react';
import { IChat } from '../../types/chatTypes';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  chat: IChat;
  currentUserId: string;
  onSendMessage: (content: string) => void;
  userName: string
}

const ChatWindow: React.FC<ChatWindowProps> = ({ chat, currentUserId, onSendMessage ,userName }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current && inputRef.current.value.trim()) {
      onSendMessage(inputRef.current.value);
      inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-primary text-white p-4">
        <h2 className="text-xl font-bold">
          {userName}
        </h2>
        <p className="text-sm">Booking #{chat.bookingId}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === currentUserId ? 'bg-primary text-white' : 'bg-gray-200'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(message.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={onSendMessage} />
    </div>
  );
};

export default ChatWindow;

