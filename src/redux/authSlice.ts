import React, { useState } from "react";
import { createSlice, PayloadAction,createAsyncThunk } from '@reduxjs/toolkit';
import { CURRENT_SOCKET } from "../module/appsocket";
import { resolve } from "node:dns";
import {encryptToken,decryptToken} from "../module/encryption"

interface AuthenticationState {
   isLoading: boolean | false;
   error: string | null;
   token: string | null;
   username: string | null;
   isLogin: boolean | false;
   isRegister: boolean | false;
   isLogout: boolean | false; 
}

const initialState: AuthenticationState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('RE_LOGIN_CODE') || null,
    username: localStorage.getItem('USERNAME') || null,
    isLogin: false,
    isRegister: false,
    isLogout: false,
}
export const login = createAsyncThunk('login', async(data: {user: string, pass: string}, {rejectWithValue}) => {
  CURRENT_SOCKET.onMessageReceived = (data) => {
        console.log("Server trả về:", data);
        if (data.event === "LOGIN") {
            if (data.status === "success") {
                console.log("Login thành công");
            } else {
                console.log("Login thất bại: Sai tài khoản mật khẩu", data.mes);
            }
            return data
        }
  };

  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect();
  }

  const response = await CURRENT_SOCKET.login(data.user, data.pass);
  if(!response.data.RE_LOGIN_CODE){
    return rejectWithValue(response.data.message || "đăng nhập thất bại")
  }
  const ecryptedToken = await encryptToken(response.data.RE_LOGIN_CODE)
  localStorage.setItem("RE_LOGIN_CODE", ecryptedToken);
  localStorage.setItem("USERNAME", data.user);
  
  return {
    token: response.data.RE_LOGIN_CODE,
    username: data.user
  };
});

export const reLogin = createAsyncThunk('reLogin', async(_, {rejectWithValue}) => {
  const decryptedToken = await decryptToken(localStorage.getItem('RE_LOGIN_CODE'));
  const username = localStorage.getItem('USERNAME');
  
  if (!decryptedToken || !username) {
    return rejectWithValue("Không tìm thấy thông tin đăng nhập");
  }

  CURRENT_SOCKET.onMessageReceived = (data) => {
    console.log("ReLogin - Server trả về:", data);
    if (data.event === "RE_LOGIN") {
      if (data.status === "success") {
        console.log("ReLogin thành công");
      } else {
        console.log("ReLogin thất bại", data.mes);
      }
      return data;
    }
  };

  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect();
  }

  const response = await CURRENT_SOCKET.reLogin(username, decryptedToken);
  
  // Nếu relogin thất bại, xóa token cũ
  if(response.status !== "success"){
    localStorage.removeItem('RE_LOGIN_CODE');
    localStorage.removeItem('USERNAME');
    return rejectWithValue(response.mes || "Phiên đăng nhập hết hạn");
  }
  const encryptedToken = await encryptToken(response.data.RE_LOGIN_CODE);
  localStorage.setItem("RE_LOGIN_CODE",encryptedToken)
  return {
    token: response.data.RE_LOGIN_CODE,
    username: username
  };
});


export const register = createAsyncThunk('register', async(data: {user: string, pass: string}, {rejectWithValue}) => {
  CURRENT_SOCKET.onMessageReceived = (data) => {
      console.log("Socket Message :" + 'event :' + data.event + ',status :' + data.status + ',mes :' + data.mes);
      if (data.event === "REGISTER") {
        if (data.status === "success") {
          console.log("đăng ký thành công");
        } else {
          console.log("đăng ký thất bại");
        } 
        return data;
      }
  };
  
  CURRENT_SOCKET.onConnected = () => {
    console.log("Socket Connected");
  }
  
  if(!CURRENT_SOCKET.isConnect()){
    await CURRENT_SOCKET.connect(); 
  }
  
  const response = await CURRENT_SOCKET.register(data.user, data.pass);
  
  if(response.event === "REGISTER" && response.mes === "User already exists!"){
    return rejectWithValue(response.mes || "đăng ký thất bại")
  }
  
  return response;
});


export const logout = createAsyncThunk('logout', async(_, {rejectWithValue}) => {
  CURRENT_SOCKET.onMessageReceived = (data) => {
      console.log("Socket Message :" + 'event :' + data.event + ',status :' + data.status + ',mes :' + data.mes);
      if (data.event === "LOGOUT") {
        if (data.status === "success") {
          console.log("đăng xuất thành công");
        } else {
          console.log("đăng xuất thất bại");
        } 
        return data;
      }
  };
  CURRENT_SOCKET.onConnected = () => {
    console.log("Socket Connected");
  }
  let response = null
  if (CURRENT_SOCKET.isConnect()) {
      response = await CURRENT_SOCKET.logout();
      console.log("Logout response:", response);
  }
  localStorage.removeItem('RE_LOGIN_CODE');
  localStorage.removeItem('USERNAME');
  CURRENT_SOCKET.onMessageReceived = null;
  CURRENT_SOCKET.onConnected = null;
  CURRENT_SOCKET.onError = null;
  CURRENT_SOCKET.onClosed = null;
  CURRENT_SOCKET.disconnect()
  return response;
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
        // Login
        .addCase(login.pending,(state)=>{
            state.error = null;
            state.isLoading=true;
            console.log("pending :")
        })
        .addCase(login.rejected,(state,action)=>{
            state.error = action.payload as string;
            state.isLoading=false;
            console.log("rejected :")
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.error = null;
            state.isLoading=false;
            state.isLogin=true;
            console.log("fulfilled :")
            state.token = action.payload.token;
            state.username = action.payload.username;
            console.log(state.username);
        })
        // ReLogin
        .addCase(reLogin.pending, (state) => {
            state.error = null;
            state.isLoading = true;
        })
        .addCase(reLogin.rejected, (state, action) => {
            state.error = action.payload as string;
            state.isLoading = false;
            state.isLogin = false;
            state.token = null;
            state.username = null;
        })
        .addCase(reLogin.fulfilled, (state, action) => {
            state.error = null;
            state.isLoading = false;
            state.isLogin = true;
            state.token = action.payload.token;
            state.username = action.payload.username;
            console.log(state.token)
        })
        // Register
        .addCase(register.pending,(state)=>{
            state.error = null;
            state.isLoading=true;
        })
        .addCase(register.rejected,(state,action)=>{
            state.error = action.payload as string;
            console.log("rejected error : " + action.payload)
            state.isLoading=false;
        })
        .addCase(register.fulfilled,(state,action)=>{
            state.error = null;
            state.isLoading=false;
            state.isRegister=true;
        })
        // Logout
        .addCase(logout.pending,(state)=>{
            state.error = null;
            state.isLoading=true;
        })
        .addCase(logout.rejected,(state,action)=>{
            state.error = action.payload as string;
            state.isLoading=false;
        })
        .addCase(logout.fulfilled,(state)=>{
            state.error = null;
            state.isLoading = false;
            state.isLogin = false;
            state.isLogout = true;
            state.token = null;
            state.username = null;
        })

  }
});


export default authSlice.reducer;
