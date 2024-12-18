import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import { AppDispatch, RootState } from '../../app/store';
import ChatWindow from '../../components/Chat/ChatWindow';
import Spinner from '../../components/Spinner';
import { listReservations } from '../../features/booking/bookingSlice';
import { Booking } from '../../types/bookingTypes';
import { IChat, IMessage } from '../../types/chatTypes';


const socket = io('http://localhost:3000');

interface ManagerChatProps {
  managerId: string;
}

const ManagerChat: React.FC<ManagerChatProps> = ({ managerId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedChat, setSelectedChat] = useState<IChat | null>(null);
  const { manager } = useSelector((state: RootState) => state.managerAuth);
  const { bookings, isLoading, isError } = useSelector((state: RootState) => state.booking);
  const API_URL = 'http://localhost:3000/manager/';

  useEffect(() => {
    if (manager && manager._id) {
      dispatch(listReservations({ managerId: manager._id }));
    }
  }, [dispatch, manager]);

  useEffect(() => {
    const handleNewMessage = (message: IMessage) => {
      console.log('Received new message:', message);
      setSelectedChat((prevChat) => {
        console.log('Previous chat ID:', prevChat?._id);
        console.log('Message chat ID:', message.chatId);
        if (prevChat && prevChat._id === message.chatId) {
          // const isDuplicate = prevChat.messages?.some(
          //   (msg) => msg._id === message._id || 
              // (msg.sender === message.sender && msg.content === message.content && msg.timestamp === message.timestamp)
          // );
          // if (isDuplicate) return prevChat;
          
          const updatedChat = { 
            ...prevChat, 
            messages: [...(prevChat.messages || []), message] 
          };
          console.log('Updated Chat:', updatedChat);
          return updatedChat;
        }        
        return prevChat;
      });
    };
  console.log("SelectedChat:",selectedChat);
  socket.off('new message'); // Prevent duplicate listeners

    socket.on('new message', handleNewMessage);
  
    return () => {
      socket.off('new message', handleNewMessage);  
    };
  }, [selectedChat,]);

  const handleUserSelect = async (booking: Booking) => {
    try {
      const token = manager?.token;
      const response = await fetch(`${API_URL}${booking._id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
  
      if (!response.ok) throw new Error('Failed to fetch chat');
  
      const existingChat = await response.json();
  
      if (existingChat && existingChat.messages.length > 0) {
        setSelectedChat(existingChat);
        socket.emit('join chat', {
          managerId: existingChat.manager,
          userId: existingChat.user._id,
          bookingId: existingChat.bookingId,
        });
      } else {
        const createResponse = await fetch(`${API_URL}send`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            receiver: booking.user,
            managerId,
            bookingId: booking._id,
            content: `Hello ${booking.userCredentials.name}, welcome to our ${booking.hotel.name}!`,
          }),
        });
  
        if (!createResponse.ok) throw new Error('Failed to create chat');
  
        const newChat = await createResponse.json();
        setSelectedChat(newChat);
        socket.emit('join chat', {
          managerId: newChat.manager,
          userId: newChat.user,
          bookingId: newChat.bookingId,
        });
      }
    } catch (error) {
      console.error('Error handling user select:', error);
    }
  };
  

  const handleSendMessage = async (content: string) => {
    if (selectedChat) {
      const message: IMessage = {
        chatId: selectedChat._id,
        sender: managerId,
        content,
        timestamp: new Date().toISOString()
      };
      
      try {
        const response = await fetch(`${API_URL}send`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${manager?.token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            receiver: selectedChat.user,
            managerId,
            bookingId: selectedChat.bookingId,
            content: message.content,
          }),
        });

        if (!response.ok) throw new Error('Failed to send message');

        // const updatedChat = await response.json();
        // setSelectedChat(updatedChat);
        socket.emit('send message', { chatId: selectedChat._id, message });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };
  
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold p-4 border-b">Users</h2>
        {isError ? (
          <p className="p-4 text-red-500">Error loading users</p>
        ) : (
          <ul>
            {bookings.map((booking) => (
              <li
                key={booking._id}
                className="p-4 hover:bg-gray-100 cursor-pointer border-b"
                onClick={() => handleUserSelect(booking)}
              >
                <p className="font-bold">{booking.userCredentials.name}</p>
                <p className="text-sm text-gray-600">Hotel: {booking.hotel.name}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex-1 bg-white shadow-md">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            currentUserId={managerId}
            onSendMessage={handleSendMessage} 
            userName={selectedChat.user.name}         
             />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a user to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerChat;