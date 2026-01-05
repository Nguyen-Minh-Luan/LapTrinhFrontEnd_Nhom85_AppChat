import React, { useState } from "react";
import { createSlice, PayloadAction,createAsyncThunk } from '@reduxjs/toolkit';
import { CURRENT_SOCKET } from "../module/appsocket";
import { resolve } from "node:dns";


interface AuthenticationState {
   isLoading:boolean | false;
   error:string | null;
   token: string | null;
   isLogin: boolean | false;
   isRegister: boolean | false;

}
const initialState: AuthenticationState = {
    isLoading:false,
    error:null,
    token:null,
    isLogin:false,
    isRegister:false,
}
export const login = createAsyncThunk('login',async(data:{user:string, pass:string},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
        console.log("Server trả về:", data);
        if (data.event === "LOGIN") {
            if (data.status === "success") {
                console.log("Login thành công");
            } else {
                console.log("Login thất bại:", data.mes);
            }
            return data
        }
  };

  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect(); 
  }

  const response = CURRENT_SOCKET.login(data.user,data.pass);
  if(!response.data.RE_LOGIN_CODE){
    return rejectWithValue(response.data.message || "đăng nhập thất bại")
  }
  return response.data

});
export const register = createAsyncThunk('register',async(data:{user:string,pass:string},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
      console.log("Socket Message :" + 'event :' + data.event+ ',status :' + data.status + ',mes :' + data.mes
       );
      if (data.event === "REGISTER") {
        if (data.status === "success") {
          console.log("đăng ký thành công");
        } else {
          console.log("đăng ký thất bại");
        } 
        return data;
      }
  };
  CURRENT_SOCKET.onConnected = ()=>{
    console.log("Socket Connected");
  }
  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect(); 
  }
  const response = CURRENT_SOCKET.register(data.user,data.pass);
  if(response.event === "REGISTER" && response.mes === "User already exists!"){
    return rejectWithValue(response.data.message || "đăng ký thất bại")
  }
  return response.data;
});
export const resetAuth = () =>{
  return initialState
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuth: () => resetAuth()
  },
  extraReducers: (builder)=>{
    builder
        .addCase(login.pending,(state)=>{
            state.error = null;
            state.isLoading=true;
        })
        .addCase(login.rejected,(state,action)=>{
            state.error = action.payload as string;
            state.isLoading=false;
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.error = null;
            state.isLoading=false;
            state.isLogin=true;
            state.token = action.payload.RE_LOGIN_CODE;
        })
        .addCase(register.pending,(state)=>{
            state.error = null;
            state.isLoading=true;
        })
        .addCase(register.rejected,(state,action)=>{
            state.error = action.payload as string;
            state.isLoading=false;
        })
        .addCase(register.fulfilled,(state,action)=>{
            state.error = null;
            state.isLoading=false;
            state.isRegister=true;
        })
  }
});


export default authSlice.reducer;
