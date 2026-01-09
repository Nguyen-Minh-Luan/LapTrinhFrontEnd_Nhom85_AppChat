import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import socketSlice from './socketSlice';
import sidebarSlice from './sidebarSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    socket: socketSlice,
    siderBar: sidebarSlice,
  },
});

// Kiểu RootState và AppDispatch để dùng với useSelector/useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
