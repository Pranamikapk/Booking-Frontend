import { format } from 'date-fns';
import { Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import Card from '../../../components/ui/Card';
import CardContent from '../../../components/ui/CardContent';
import Input from '../../../components/ui/Input';
import { Message } from '../../../types/chatTypes';
interface ChatInterfaceProps {
  bookingId: string;
  recipientId: string;
  recipientName: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  bookingId,
  recipientId,
  recipientName,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const API_URL = 'http://localhost:3000/manager/';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}chat/${bookingId}`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); 

    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true); 
    try {
      const response = await fetch(`${API_URL}chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage,
          receiver: recipientId,
          bookingId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const message = await response.json();
      setMessages((prevMessages) => [...prevMessages, message]); 
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="bg-primary p-4 text-white">
        <h2 className="text-lg font-semibold">{recipientName}</h2>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender === user?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender === user?._id ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === user?._id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}
              >
                {format(new Date(message.timestamp), 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
            disabled={isSending} 
          />
          <button
            type="submit"
            className="p-2 w-11 h-13 bg-primary rounded-lg flex items-center justify-center"
            disabled={isSending} 
          >
            <Send className={`h-5 w-5 ${isSending ? 'opacity-50' : ''}`} />
          </button>
        </div>
      </form>
    </Card>
  );
};

export default ChatInterface;
