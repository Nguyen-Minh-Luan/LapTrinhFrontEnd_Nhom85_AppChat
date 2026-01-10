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

    updateLastMessage: (state, action: PayloadAction<{ name: string; mes: string; isRealtime: boolean; actionTime?: string }>) => {
  const { name, mes, isRealtime, actionTime } = action.payload;
  
  const index = state.userList.findIndex(
    (u) => u.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  if (index !== -1) {
    state.userList[index].lastMes = mes;
    if (actionTime) {
      state.userList[index].actionTime = actionTime;
    }

    if (isRealtime && state.activeChat?.name !== state.userList[index].name) {
      state.userList[index].isUnread = true;
      state.userList[index].unreadCount = (state.userList[index].unreadCount || 0) + 1;
    }

    if (isRealtime) {
      const [movedItem] = state.userList.splice(index, 1);
      state.userList.unshift(movedItem);
    }
  }
}
  },
});

export const { setUserList, setActiveChat, updateLastMessage } = sidebarSlice.actions;
export default sidebarSlice.reducer;