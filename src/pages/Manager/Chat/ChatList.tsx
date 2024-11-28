
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../app/store';
import Card from '../../../components/ui/Card';
import { ChatRoom } from '../../../types/chatTypes';

interface ChatListProps {
    onSelectChat: (chatRoom: ChatRoom) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                const response = await fetch('/api/chat/rooms', {
                    credentials: 'include'
                });
                const data = await response.json();
                setChatRooms(data);
            } catch (error) {
                console.error('Error fetching chat rooms:', error);
            }
        };
        fetchChatRooms();
    }, []);

    return (
        <Card className="h-[600px] overflow-y-auto">
            <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Conversations</h2>
            </div>

            <div className="divide-y">
                {chatRooms.map((room) => (
                    <div
                        key={room._id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => onSelectChat(room)}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-medium">Booking #{room.bookingId}</h3>
                                {room.lastMessage && (
                                    <p className="text-sm text-muted-foreground truncate">
                                        {room.lastMessage.content} fefzrg
                                    </p>
                                )}
                            </div>
                            {room.lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                    {format(new Date(room.lastMessage.timestamp), 'MMM d, HH:mm')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default ChatList;

