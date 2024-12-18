import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NotificationState, UnreadMessage } from '../../types/chatTypes';

const initialState: NotificationState = {
  unreadCount: 0,
  unreadMessages: [],
  lastChatId: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addUnreadMessage: (state, action: PayloadAction<UnreadMessage>) => {
      state.unreadCount += 1;
      state.unreadMessages.push(action.payload);
      state.lastChatId = action.payload.chatId;
    },
    clearNotifications: (state) => {
      state.unreadCount = 0;
      state.unreadMessages = [];
      state.lastChatId = null;
    },
  },
});

export const { addUnreadMessage, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;

