import React from 'react';
import { IChat } from '../../types/chatTypes';

interface ChatListProps {
  chats: IChat[];
  onSelectChat: (chat: IChat) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, onSelectChat }) => {
  return (
    <div>
      <h2 className="text-xl font-bold p-4 border-b">Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat._id}
            className="p-4 hover:bg-gray-100 cursor-pointer border-b"
            onClick={() => onSelectChat(chat)}
          >
            <p className="font-semibold">Booking #{chat.hotelId}</p>
            <p className="text-sm text-gray-600">
              {chat.messages.length > 0
                ? `Last message: ${chat.messages[chat.messages.length - 1].content}`
                : 'No messages yet'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;

