import React, { useState } from "react";
import { createSlice, PayloadAction,createAsyncThunk } from '@reduxjs/toolkit';
import { CURRENT_SOCKET } from "../module/appsocket";
import { resolve } from "node:dns";


interface AuthenticationState {
   isLoading:boolean | false;
   error:string | null;
   token: string | null;
   isLogin: boolean | false;

}
const initialState: AuthenticationState = {
    isLoading:false,
    error:null,
    token:null,
    isLogin:false,
}
export const login = createAsyncThunk('login',async(data:{user:string, pass:string},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
        console.log("Server trả về:", data);
        if (data.event === "LOGIN") {
            if (data.status === "success") {
                console.log("Login thành công");
                return data
            } else {
                console.log("Login thất bại:", data.message);
                return data
            }
        }
  };
  CURRENT_SOCKET.onConnected = ()=>{
    console.log("Socket Connected");
  }
  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect(); 
  }

  const response = CURRENT_SOCKET.login(data.user,data.pass);
  if(!response.data.RE_LOGIN_CODE){
    return rejectWithValue(response.data.message || "đăng nhập thất bại")
  }
  return response.data

});
export const register = createAsyncThunk('login',async(data:{user:string, pass:string},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
        console.log("Server trả về:", data);
        if (data.event === "LOGIN") {
            if (data.status === "success") {
                console.log("Login thành công");
                return data
            } else {
                console.log("Login thất bại:", data.message);
                return data
            }
        }
  };
  CURRENT_SOCKET.onConnected = ()=>{
    console.log("Socket Connected");
  }
  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect(); 
  }

  const response = CURRENT_SOCKET.login(data.user,data.pass);
  if(!response.data.RE_LOGIN_CODE){
    return rejectWithValue(response.data.message || "đăng nhập thất bại")
  }
  return response.data

});
export const logout = createAsyncThunk('login',async(data:{user:string, pass:string},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
        console.log("Server trả về:", data);
        if (data.event === "LOGIN") {
            if (data.status === "success") {
                console.log("Login thành công");
                return data
            } else {
                console.log("Login thất bại:", data.message);
                return data
            }
        }
  };
  CURRENT_SOCKET.onConnected = ()=>{
    console.log("Socket Connected");
  }
  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect(); 
  }

  const response = CURRENT_SOCKET.login(data.user,data.pass);
  if(!response.data.RE_LOGIN_CODE){
    return rejectWithValue(response.data.message || "đăng nhập thất bại")
  }
  return response.data

});
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
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
            state.token = action.payload.RE_LOGIN_CODE
        })
  }
});


export default authSlice.reducer;
