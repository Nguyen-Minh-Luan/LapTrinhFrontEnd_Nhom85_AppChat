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
   isLogout: boolean | false; 
}
const initialState: AuthenticationState = {
    isLoading:false,
    error:null,
    token: localStorage.getItem('RE_LOGIN_CODE') || null,
    isLogin:false,
    isRegister:false,
    isLogout: false,

}
export const login = createAsyncThunk('login',async(data:{user:string, pass:string},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
        console.log("Server trả về:", data);
        if (data.event === "LOGIN") {
            if (data.status === "success") {
              // console.log("isLogin = " + initialState.isLogin);
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

  if(CURRENT_SOCKET.isConnect()){
  const response = CURRENT_SOCKET.login(data.user,data.pass);
  if(!response.data.RE_LOGIN_CODE){
    return rejectWithValue(response.data.message || "đăng nhập thất bại")
  }
  localStorage.setItem("RE_LOGIN_CODE",response.data.RE_LOGIN_CODE);
  return response.data
  }
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


export const logout = createAsyncThunk('logout',async({},{rejectWithValue})=>{
  CURRENT_SOCKET.onMessageReceived = (data) => {
      console.log("Socket Message :" + 'event :' + data.event+ ',status :' + data.status + ',mes :' + data.mes
       );
      if (data.event === "LOGOUT") {
        if (data.status === "success") {
          console.log("đăng xuất thành công");
        } else {
          console.log("đăng xuất thất bại");
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
  const response = CURRENT_SOCKET.logout();
  if(response.event === "LOGOUT" && response.status !== "success"){
    return rejectWithValue(response.data.message || "đăng xuất thất bại")
  }
  localStorage.removeItem('RE_LOGIN_CODE')
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
            console.log("pending :" + state.isLogin)
        })
        .addCase(login.rejected,(state,action)=>{
            state.error = action.payload as string;
            state.isLoading=false;
            console.log("rejected :" + state.isLogin)
        })
        .addCase(login.fulfilled,(state,action)=>{
            state.error = null;
            state.isLoading=false;
            state.isLogin=true;
            console.log("fulfilled :" + state.isLogin)
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
            state.isLogout = true;
            state.isLogin = false;
            state.token = null;
        })

  }
});


export default authSlice.reducer;
