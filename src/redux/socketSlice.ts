import React, { useState } from "react";
import { createSlice, PayloadAction,createAsyncThunk } from '@reduxjs/toolkit';
import { CURRENT_SOCKET } from "../module/appsocket";
//interface trong TypeScript là định nghĩa 1 kiểu dữ liệu custom
//không phải interface như trong Java Core đâu

interface SocketState {
   error:string | null;
   status: 'idle' | 'connecting' | 'open' | 'closed' | 'error';
   token: string | null;
   isLogin: boolean | false;

}

const initialState: SocketState ={
    error:null,
    status: "idle",
    token:null,
    isLogin:false,
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnecting: (state,action) => { state.status = 'connecting' },
    setOpen: (state) => { state.status = 'open'; },
    setClosed: (state) => { state.status = 'closed'; },
    setError: (state) => { state.status = 'error'; },
  },
});

export default socketSlice.reducer;
