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
  bookingId: string
  messages: IMessage[];
}

interface ChatInterfaceProps {
  userId: string;
  isManager: boolean;
}