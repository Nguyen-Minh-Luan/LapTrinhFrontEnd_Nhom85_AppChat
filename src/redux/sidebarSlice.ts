import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatItem {
  name: string;
  type: number;
  lastMes: string;
  unreadCount: number;
  isUnread: boolean;
  actionTime: string;
}

interface SidebarState {
  userList: ChatItem[];
  activeChat: ChatItem | null;
}

const initialState: SidebarState = {
  userList: [],
  activeChat: null,
};

const getTimestamp = (timeStr: string | undefined): number => {
  if (!timeStr) return 0;
  return new Date(timeStr.replace(/-/g, "/")).getTime();
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setUserList: (state, action: PayloadAction<any[]>) => {
      const newList = action.payload.map((newUser) => {
        const oldUser = state.userList.find(u => u.name === newUser.name);
        return {
          ...newUser,
          lastMes: oldUser?.lastMes || newUser.lastMes || "",
          unreadCount: oldUser?.unreadCount || 0,
          isUnread: oldUser?.isUnread || false,
          actionTime: newUser.actionTime || oldUser?.actionTime || new Date().toISOString()
        };
      });
      state.userList = newList.sort((a, b) => getTimestamp(b.actionTime) - getTimestamp(a.actionTime));
    },

    setActiveChat: (state, action: PayloadAction<ChatItem | null>) => {
      state.activeChat = action.payload;
      if (!action.payload) return;

      const index = state.userList.findIndex(
        u => u.name.trim().toLowerCase() === action.payload?.name.trim().toLowerCase()
      );
      if (index !== -1) {
        state.userList[index].unreadCount = 0;
        state.userList[index].isUnread = false;
      }
    },

    updateLastMessage: (state, action: PayloadAction<{ name: string; mes: string; isRealtime: boolean; actionTime?: string }>) => {
      const { name, mes, isRealtime, actionTime } = action.payload;

      const index = state.userList.findIndex(
        (u) => u.name.trim().toLowerCase() === name.trim().toLowerCase()
      );

      if (index !== -1) {
        const existingUser = state.userList[index];
        const newTime = actionTime || new Date().toISOString();

        if (isRealtime || getTimestamp(newTime) >= getTimestamp(existingUser.actionTime)) {
          existingUser.lastMes = mes;
          existingUser.actionTime = newTime;

          if (isRealtime && state.activeChat?.name !== existingUser.name) {
            existingUser.isUnread = true;
            existingUser.unreadCount = (existingUser.unreadCount || 0) + 1;
          }

          state.userList.sort((a, b) => getTimestamp(b.actionTime) - getTimestamp(a.actionTime));
        }
      }
    },

    addRoomToList: (state, action: PayloadAction<Partial<ChatItem>>) => {
      const roomData = action.payload;
      const index = state.userList.findIndex(u => u.name === roomData.name);
      
      if (index === -1) {
        const newEntry: ChatItem = {
          name: roomData.name || "Unknown",
          type: roomData.type ?? 1,
          lastMes: roomData.lastMes || "Bắt đầu cuộc trò chuyện...",
          actionTime: roomData.actionTime || new Date().toISOString(),
          unreadCount: 0,
          isUnread: false
        };
        state.userList = [newEntry, ...state.userList];
      } else {
        state.userList[index] = { ...state.userList[index], ...roomData };
        state.userList.sort((a, b) => getTimestamp(b.actionTime) - getTimestamp(a.actionTime));
      }
    },
  },
});

export const { 
  setUserList, 
  setActiveChat, 
  updateLastMessage, 
  addRoomToList 
} = sidebarSlice.actions;

export default sidebarSlice.reducer;