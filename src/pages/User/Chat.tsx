import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { RootState } from '../../app/store';
import ChatWindow from '../../components/Chat/ChatWindow';
import Spinner from '../../components/Spinner';

const socket = io('http://localhost:3000', { autoConnect: false });

interface IMessage {
  _id: string;
  sender: string;
  content: string;
  timestamp: string;
  chatId: string;
}

interface IChat {
  _id: string;
  manager: string;
  user: string;
  hotelId: string;
  bookingId: string;
  messages: IMessage[];
}

const UserChat: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [chat, setChat] = useState<IChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const API_URL = 'http://localhost:3000/';

  const handleNewMessage = useCallback((message: IMessage) => {
    setChat((prevChat) => {
      if (prevChat && prevChat._id === message.chatId) {
        const alreadyExists = prevChat.messages.some((msg) => msg._id === message._id);
        if (!alreadyExists) {
          return { 
            ...prevChat, 
            messages: [
              ...prevChat.messages, 
              { ...message, timestamp: message.timestamp || new Date().toISOString() }
            ]
          };
        }
      }
      return prevChat;
    });
  }, []);

  useEffect(() => {
    const fetchChat = async () => {
      if (!user?.token || !bookingId) return;

      try {
        const response = await fetch(`${API_URL}${bookingId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch chat data');
        const data = await response.json();
        setChat(data);

        socket.connect();
        socket.emit('join chat', {
          userId: user._id,
          managerId: data.manager,
          bookingId: data.bookingId,
        });

        socket.on('new message', handleNewMessage);
      } catch (error) {
        console.error('Error fetching chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChat();

    return () => {
      socket.off('new message', handleNewMessage);
      socket.disconnect();
    };
  }, [user, bookingId, handleNewMessage]);

  const handleSendMessage = async (content: string) => {
    if (!chat || !content.trim() || !user?._id) return;

    try {
      const response = await fetch(`${API_URL}send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content,
          sender: user._id,
          receiver: chat.manager,
          bookingId: chat.bookingId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      const sentMessage: IMessage = await response.json();

      const newMessage: IMessage = {
        _id: sentMessage._id,
        sender: sentMessage.sender,
        content: sentMessage.content,
        timestamp: sentMessage.timestamp || new Date().toISOString(),
        chatId: chat._id,
      };

      setChat((prevChat) => {
        if (!prevChat) return null;
        return {
          ...prevChat,
          messages: [...prevChat.messages, newMessage],
        };
      });
      
      socket.emit('send message', { chatId: chat._id, message: newMessage });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {chat ? (
        <ChatWindow
          chat={chat}
          currentUserId={user?._id || ''}
          onSendMessage={handleSendMessage}
        />
      ) : (
        <div className="text-center p-4">Chat data not available.</div>
      )}
    </div>
  );
};

export default UserChat;

