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
          actionTime: oldUser?.actionTime || newUser.actionTime || ""
        };
      });

      state.userList = newList.sort((a: ChatItem, b: ChatItem) => 
        getTimestamp(b.actionTime) - getTimestamp(a.actionTime)
      );
    },

    setActiveChat: (state, action: PayloadAction<ChatItem>) => {
      state.activeChat = action.payload;
      const index = state.userList.findIndex(
        u => u.name.trim().toLowerCase() === action.payload.name.trim().toLowerCase()
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
        const newTime = getTimestamp(actionTime);
        const oldTime = getTimestamp(existingUser.actionTime);

        if (newTime >= oldTime || isRealtime) {
          const updatedUser = {
            ...existingUser,
            lastMes: mes,
            actionTime: actionTime || existingUser.actionTime 
          };

          if (isRealtime && state.activeChat?.name !== updatedUser.name) {
            updatedUser.isUnread = true;
            updatedUser.unreadCount = (updatedUser.unreadCount || 0) + 1;
          }

          const remainingUsers = state.userList.filter((_, i) => i !== index);
          const newList = [updatedUser, ...remainingUsers];

          state.userList = newList.sort((a: ChatItem, b: ChatItem) => 
            getTimestamp(b.actionTime) - getTimestamp(a.actionTime)
          );
        }
      }
    }
  },
});

export const { setUserList, setActiveChat, updateLastMessage } = sidebarSlice.actions;
export default sidebarSlice.reducer;