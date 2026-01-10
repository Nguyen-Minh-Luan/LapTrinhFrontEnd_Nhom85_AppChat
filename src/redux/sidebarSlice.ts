import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  userList: any[];
  activeChat: any | null;
}

const initialState: SidebarState = {
  userList: [],
  activeChat: null,
};

const getTimestamp = (timeStr: string | undefined) => {
  if (!timeStr) return 0;
  return new Date(timeStr.replace(/-/g, "/")).getTime();
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setUserList: (state, action) => {
      const newList = action.payload.map((newUser: any) => {
        const oldUser = state.userList.find(u => u.name === newUser.name);
        return {
          ...newUser,
          lastMes: oldUser?.lastMes || newUser.lastMes || "",
          unreadCount: oldUser?.unreadCount || 0,
          isUnread: oldUser?.isUnread || false,
          actionTime: oldUser?.actionTime || newUser.actionTime || ""
        };
      });

      state.userList = newList.sort((a, b) => getTimestamp(b.actionTime) - getTimestamp(a.actionTime));
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
    const updatedUser = {
      ...state.userList[index],
      lastMes: mes,
      actionTime: actionTime || state.userList[index].actionTime 
    };

    if (isRealtime && state.activeChat?.name !== updatedUser.name) {
      updatedUser.isUnread = true;
      updatedUser.unreadCount = (updatedUser.unreadCount || 0) + 1;
    }

    const remainingUsers = state.userList.filter((_, i) => i !== index);
    
    state.userList = [updatedUser, ...remainingUsers];

    if (!isRealtime) {
      state.userList.sort((a, b) => getTimestamp(b.actionTime) - getTimestamp(a.actionTime));
    }
  }
}
  },
});

export const { setUserList, setActiveChat, updateLastMessage } = sidebarSlice.actions;
export default sidebarSlice.reducer;