import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  userList: any[];
  activeChat: any | null;
}

const initialState: SidebarState = {
  userList: [],
  activeChat: null,
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setUserList: (state, action) => {
      state.userList = action.payload.map((newUser: any) => {
        const oldUser = state.userList.find(u => u.name === newUser.name);
        return {
          ...newUser,
          lastMes: oldUser?.lastMes || "",
          unreadCount: oldUser?.unreadCount || 0,
          isUnread: oldUser?.isUnread || false
        };
      });
    },

    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      const index = state.userList.findIndex(u => u.name === action.payload.name);
      if (index !== -1) {
        state.userList[index].unreadCount = 0;
        state.userList[index].isUnread = false;
      }
    },

    updateLastMessage: (state, action: PayloadAction<{ name: string; mes: string; isRealtime: boolean }>) => {
      const { name, mes, isRealtime } = action.payload;
      const index = state.userList.findIndex((u) => u.name.trim() === name.trim());

      if (index !== -1) {
        const isCurrentlyActive = state.activeChat?.name === name;

        state.userList[index].lastMes = mes;

        if (isRealtime && !isCurrentlyActive) {
          state.userList[index].unreadCount = (state.userList[index].unreadCount || 0) + 1;
          state.userList[index].isUnread = true;
        } 
        
        if (isCurrentlyActive) {
          state.userList[index].unreadCount = 0;
          state.userList[index].isUnread = false;
        }
      }
    }
  },
});

export const { setUserList, setActiveChat, updateLastMessage } = sidebarSlice.actions;
export default sidebarSlice.reducer;