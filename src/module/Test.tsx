import React, { use, useEffect } from "react";
import { CURRENT_SOCKET } from "../module/appsocket.ts";
import { useNavigate } from "react-router-dom";
const Test = () =>{
  const navigate = useNavigate();
useEffect(() => {
  const connectAsync = async () => { 
     await CURRENT_SOCKET.connect();
     CURRENT_SOCKET.login("22130154", "12345"); 
    }; 
    connectAsync(); 
  CURRENT_SOCKET.onConnected = () => { 
    console.log("✅ Socket connected"); 
  };

  CURRENT_SOCKET.onMessageReceived = (data) => {
    console.log("📩 Server response:", data);
    if(data.event === "LOGIN"){
      if(data.status === "success"){
        navigate("/register")
      }else{
        console.log("đăng nhập thất bại");
        
      }
    }
  };

  CURRENT_SOCKET.onError = (e) => {
    console.log("❌ Socket error", e);
  };

  CURRENT_SOCKET.onClosed = () => {
    console.log("🔌 Socket closed");
  };
}, []);
return (
    <div>mở f12 lên coi</div>
);
}
export default Test;