import { User } from "./userTypes";

export interface IMessage {
  _id?: string;
  sender: string;
  content: string;
  timestamp: string;
  chatId: string; 
}

export interface IChat {
  _id: string;
  manager: User;
  user: User;
  hotelId: string;
  bookingId: string
  messages: IMessage[];
}

export interface ChatInterfaceProps {
  userId: string;
  isManager: boolean;
}

export interface UnreadMessage {
  chatId: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export interface NotificationState {
  unreadCount: number;
  unreadMessages: UnreadMessage[];
  lastChatId: string | null;
}