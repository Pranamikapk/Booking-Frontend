import { Bell } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { RootState } from '../../app/store';
import ChatWindow from '../../components/Chat/ChatWindow';
import Spinner from '../../components/Spinner';
import { addUnreadMessage } from '../../features/home/notificationSlice';
import { IChat, IMessage } from '../../types/chatTypes';

const API_URL = 'http://localhost:3000/';
const socket = io(API_URL, { autoConnect: false });

const UserChat: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [chat, setChat] = useState<IChat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTabActive, setIsTabActive] = useState(true);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch()

  useEffect(() => {
    const handleVisibilityChange = () => {
      const tabActive = !document.hidden;
      setIsTabActive(tabActive);
      if (tabActive) {
        setUnreadCount(0);
        document.title = 'Chat';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleNewMessage = useCallback(
    (message: IMessage) => {
      console.log('Received new message:', message);
      setChat((prevChat) => {
        console.log('Previous chat ID:', prevChat?._id);
        console.log('Message chat ID:', message.chatId);
        if (prevChat && prevChat._id === message.chatId) {
          console.log('Updating selectedChat messages...');
          
          const updatedChat = { 
            ...prevChat, 
            messages: [...(prevChat.messages || []), message] 
          };
          console.log('Updated Chat:', updatedChat);
          return updatedChat;
        }
        console.log("not updated");
        
        return prevChat;
      });
      if (!isTabActive && message.sender !== user?._id) {
        console.log('Dispatching addUnreadMessage from UserChat');
        dispatch(addUnreadMessage({
          chatId: message.chatId,
          senderId: message.sender,
          content: message.content,
          timestamp: new Date().toISOString(),
        }));
      }
    },
    [isTabActive, user?._id, dispatch]
  );

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
        console.log('Fetched chat data:', data); 

        if (data.manager) {
          setChat(data);
        } else {
          console.error('No manager data available in the chat response');
        }

        socket.connect();
        socket.emit('join chat', {
          userId: data.user._id,
          managerId: data.manager._id,
          bookingId: data.bookingId,
          chatId: data._id,
        });
        socket.off('new message'); 
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
      document.title = 'Chat';
    };
  }, [user, bookingId, handleNewMessage]);

  const handleSendMessage = async (content: string) => {
    if (!chat || !content.trim() || !user?._id) return;
  console.log(chat,content,user._id);
  
    try {
      const response = await fetch(`${API_URL}send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          receiver: chat.manager,
          senderId: chat.user._id,
          bookingId: chat.bookingId,
        }),
      });
      console.log('Payload:', {
        content,
        receiver: chat.manager._id,
        senderId: chat.user._id,

        bookingId: chat.bookingId,
      }); 
      if (response.ok) {
        const updatedChat = await response.json(); 
  
        console.log('Message sent successfully:', updatedChat);
  
        const newMessage = updatedChat.messages[updatedChat.messages.length - 1];
  
        socket.emit('send message', {
          chatId: chat._id,
          message: newMessage,
        });
  
        setChat(updatedChat);
      } else {
        console.error('Error sending message response:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  console.log("Selectedchat:",chat);

  if (isLoading) return <Spinner />;

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-xl mx-auto bg-gray-100 rounded-lg shadow-lg">
      {chat ? (
        <>
          <div className="flex items-center justify-between bg-white p-4 border-b">
            {unreadCount > 0 && (
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-blue-500" />
                <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              </div>
            )}
          </div>
          <ChatWindow
            chat={chat}
            currentUserId={user?._id || ''}
            onSendMessage={handleSendMessage}
            userName={chat.manager.name}
          />
        </>
      ) : (
        <div className="text-center p-4">Chat data not available.</div>
      )}
    </div>
  );
};

export default UserChat;
