export interface Message {
    _id: string;
    sender: string;
    receiver: string;
    content: string;
    timestamp: Date;
    bookingId: string;
    read: boolean;
  }
  
  export interface ChatRoom {
    _id: string;
    bookingId: string;
    userId: string;
    managerId: string;
    lastMessage?: Message;
    updatedAt: Date;
  }
  
  