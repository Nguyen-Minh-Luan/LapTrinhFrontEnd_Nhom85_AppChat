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
      const newList = action.payload.map((newUser: any) => {
        const oldUser = state.userList.find(u => u.name === newUser.name);
        return oldUser ? { ...newUser, lastMes: oldUser.lastMes } : newUser;
      });
      state.userList = newList;
    },
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    updateLastMessage: (state, action: PayloadAction<{ name: string; mes: string }>) => {
  const index = state.userList.findIndex(
    (u) => u.name.trim() === action.payload.name.trim()
  );
  if (index !== -1) {
    state.userList[index] = {
      ...state.userList[index],
      lastMes: action.payload.mes
    };
  }
}
  },
});

export const { setUserList, setActiveChat, updateLastMessage } = sidebarSlice.actions;
export default sidebarSlice.reducer;