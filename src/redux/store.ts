import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import socketSlice from './socketSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    socket: socketSlice,
  },
});

// Kiểu RootState và AppDispatch để dùng với useSelector/useDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
