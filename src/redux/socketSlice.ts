import React, { useState } from "react";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
//interface trong TypeScript là định nghĩa 1 kiểu dữ liệu custom
//không phải interface như trong Java Core đâu
interface SocketState {
   status: 'idle' | 'connecting' | 'open' | 'closed' | 'error';
}

const initialState: SocketState ={
    status: "idle"
}

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnecting: (state) => { state.status = 'connecting'; },
    setOpen: (state) => { state.status = 'open'; },
    setClosed: (state) => { state.status = 'closed'; },
    setError: (state) => { state.status = 'error'; },
  },
});

export default socketSlice